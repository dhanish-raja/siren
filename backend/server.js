// Import necessary packages
require('dotenv').config(); // Loads environment variables from a .env file
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const https = require('https');

// --- Configuration ---
const app = express();
const PORT = 8080; // Port to match your frontend's fetch request
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Multer setup for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// --- Gemini API Interaction ---
/**
 * Processes the audio data by sending it to the Google Gemini API.
 * @param {Buffer} audioBuffer - The audio file data as a buffer.
 * @returns {Promise<string>} A promise that resolves to the JSON text response from Gemini.
 */
async function processAudioWithGemini(audioBuffer) {
  // 1. Prepare the request data for the Gemini API
  const encodedAudio = audioBuffer.toString('base64');
  const prompt = `You are a headless AI data processing unit. Your sole function is to receive unstructured audio from an emergency reporting system, transcribe it, and convert the transcribed text into a structured, valid JSON object based on the schema and rules provided below. You must act as a silent parser; do not output any text, explanations, apologies, or markdown formatting—only the final JSON object.

---

### **JSON Output Schema**

You must generate a JSON object that strictly conforms to the following field definitions:

* **"name"**
    * **Type:** \`string\`
    * **Description:** The full name of the caller or any individual explicitly identified in the report.
    * **Constraint:** If no name is mentioned, this key **MUST** be completely omitted from the JSON output.

* **"department"**
    * **Type:** \`string\` (Enumeration)
    * **Description:** The single most relevant emergency service department for the incident.
    * **Constraint:** The value **MUST** be one of the following: \`"fire"\`, \`"police"\`, \`"hospital"\`, \`"ambulance"\`, \`"IT"\`. If the situation is ambiguous, infer the most likely department (e.g., strange activity defaults to \`"police"\`).

* **"time"**
    * **Type:** \`string\`
    * **Description:** The specific time mentioned in the report (e.g., \`"4:15 PM"\`, \`"yesterday"\`).
    * **Constraint:** If no time is mentioned, this key **MUST** be omitted. Do not guess or calculate the current time.

* **"priority"**
    * **Type:** \`string\` (Enumeration)
    * **Description:** The assessed urgency of the situation.
    * **Constraint:** The value **MUST** be one of the following: \`"high"\`, \`"medium"\`, \`"low"\`.
        * Use \`"high"\` for reports involving immediate threats to life or property (e.g., fire, injury, attack, person trapped).
        * Use \`"medium"\` for serious but not life-threatening situations (e.g., theft, power outage, suspicious activity).
        * Use \`"low"\` for non-urgent issues or general inquiries.

* **"location"**
    * **Type:** \`string\`
    * **Description:** The specific physical location of the incident.
    * **Constraint:** Extract as much detail as possible (e.g., "Building B, 3rd floor", "corner of Main St and 1st Ave").

* **"summary"**
    * **Type:** \`string\`
    * **Description:** A brief, neutral, one-sentence summary of the core incident.
    * **Constraint:** Do not include greetings or conversational filler.

* **"status"**
    * **Type:** \`string\` (Enumeration)
    * **Description:** The initial status of the incoming report.
    * **Constraint:** For every new report you process, this value **MUST** always be \`"pending"\`.

---

### **Core Processing Directives**

1.  **JSON ONLY:** Your entire output must be a single, raw, syntactically correct JSON object. Nothing before or after the \`{}\` braces.
2.  **OMIT IF ABSENT:** If the information for a field (like \`name\` or \`time\`) is not present in the input text, you **MUST** omit the entire key-value pair. Do not use \`null\`, \`""\`, or \`"N/A"\`.
3.  **NO EXTRA TEXT:** Do not include explanations, comments, or markdown code blocks (\`\`\`json ... \`\`\`).

---

### **Training Examples**

**Example 1: Fire Incident**
* **Input Audio Transcript:** "There is a huge fire in Building B near the main campus, and I think two cars are burning. It's an emergency!"
* **Correct Output:**
    \`\`\`json
    {
      "department": "fire",
      "priority": "high",
      "location": "Building B near the main campus",
      "summary": "A large fire in Building B with two cars burning.",
      "status": "pending"
    }
    \`\`\`

**Example 2: Medical Emergency with Name and Time**
* **Input Audio Transcript:** "This is John Smith. My father collapsed at the waterfront park around 3 PM. He can't breathe properly. Please send help fast."
* **Correct Output:**
    \`\`\`json
    {
      "name": "John Smith",
      "department": "ambulance",
      "time": "3 PM",
      "priority": "high",
      "location": "waterfront park",
      "summary": "A man collapsed and is having difficulty breathing.",
      "status": "pending"
    }
    \`\`\`

---

Now, process the audio report provided and return only the JSON object.`;

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'audio/webm', // The frontend sends audio/webm
            data: encodedAudio
          }
        }
      ]
    }]
  };

  // 2. Make the POST request to the Gemini API
  const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.text();
    throw new Error(`Gemini API request failed with status ${apiResponse.status}: ${errorBody}`);
  }

  // 3. Parse and extract the relevant JSON text from the response
  const responseData = await apiResponse.json();
  const geminiText = responseData.candidates[0].content.parts[0].text;
  
  // The response from Gemini is a string that is formatted as JSON, so we return it directly.
  return geminiText;
}

// --- API Endpoint ---
// Define a POST endpoint to handle audio uploads
app.post('/api/audio/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log(`Received file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

  try {
    const geminiJsonResponse = await processAudioWithGemini(req.file.buffer);
    console.log("Successfully processed audio with Gemini.");
    
    // The result from Gemini should already be a JSON string, so we parse it 
    // and send it back as a JSON object to the client.
    // The model sometimes wraps the JSON in markdown. We need to extract only the JSON part.
const match = geminiJsonResponse.match(/{[\s\S]*}/);

if (match) {
    const jsonString = match[0];
    res.status(200).json(JSON.parse(jsonString));
} else {
    // If for some reason no JSON object is found in the response, throw an error.
    throw new Error("No valid JSON found in Gemini response.");
}

  } catch (error) {
    console.error('Error processing audio with Gemini:', error);
    res.status(500).send('Error: Failed to process audio.');
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚨 SIREN JS Backend Started! Listening for audio uploads on http://localhost:${PORT}`);
});
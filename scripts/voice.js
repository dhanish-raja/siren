let mediaRecorder;
let audioChunks = [];
let recordButton = document.getElementById("record");
let downloadLink = document.getElementById("download");
let isRecording = false;

recordButton.onclick = async (e) => {
  e.preventDefault();
  
  if (!isRecording) {
    // Start Recording
    isRecording = true;
    recordButton.style.backgroundColor = "red";
    recordButton.innerText = "Recording...\nClick again to stop & send";
    
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

  } else {
    // Stop Recording
    isRecording = false;
    recordButton.style.backgroundColor = "grey";
    recordButton.innerText = "Processing...";
    mediaRecorder.stop();
    
    mediaRecorder.onstop = async () => {
      let blob = new Blob(audioChunks, { type: "audio/webm" });
      let url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "recording.webm";
      
      let formData = new FormData();
      formData.append("file", blob, "recording.webm");

      try {
        let response = await fetch("http://localhost:8080/api/audio/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        let result = await response.json(); 
        console.log("Upload success:", result);
        
        // ===================================================
        // == MODIFICATION: Save response and redirect page ==
        // ===================================================
        // 1. Save the JSON response to session storage
        sessionStorage.setItem('sirenResponse', JSON.stringify(result));

        // 2. Redirect to the new response page
        window.location.href = 'response.html';

      } catch (err) {
        console.error("Upload failed:", err);
        recordButton.style.backgroundColor = "red";
        recordButton.innerText = "Failed to send";
        setTimeout(() => {
          recordButton.style.backgroundColor = "green";
          recordButton.innerText = "Record";
        }, 2000);
      }
      
      audioChunks = [];
    };
  }
};
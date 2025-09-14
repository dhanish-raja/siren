package com.siren;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.util.Base64;

@Component
public class GeminiClient {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiClient(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
                .build();
    }

    @PostConstruct
    public void init() {
        try {
            // Load example audio file from resources
            byte[] audioBytes = Files.readAllBytes(new ClassPathResource("example.mp3").getFile().toPath());
            String jsonResult = processAudio(audioBytes, "example.mp3");

            // Print JSON to console
            System.out.println("Gemini JSON Output:\n" + jsonResult);

            // Save JSON to file in project root
            File outFile = new File("output.json");
            try (FileWriter writer = new FileWriter(outFile)) {
                writer.write(jsonResult);
            }
            System.out.println("JSON saved to: " + outFile.getAbsolutePath());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String processAudio(byte[] audioBytes, String fileName) {
        try {
            String prompt = """
                    You are an AI assistant.
                    1. Transcribe the given audio.
                    2. Extract and return the following fields strictly as JSON:
                    { "name": "", "department": "", "time": "", "priority": "", "location": "", "summary": "" }
                    Do not include extra text or explanations.
                    """;

            String rawResponse = webClient.post()
                    .uri("/") // base URL already set
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue("""
                            {
                              "contents": [{
                                "parts": [
                                  {"text": "%s"},
                                  {"inline_data": {
                                    "mime_type": "audio/mp3",
                                    "data": "%s"
                                  }}
                                ]
                              }]
                            }
                            """.formatted(prompt, Base64.getEncoder().encodeToString(audioBytes)))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Extract JSON string from Gemini response
            String json = mapper.readTree(rawResponse)
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            return json;

        } catch (Exception e) {
            throw new RuntimeException("Failed to process audio with Gemini: " + e.getMessage(), e);
        }
    }
}

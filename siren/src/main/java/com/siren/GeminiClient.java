package com.siren;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class GeminiClient {

    private final WebClient webClient;

    public GeminiClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://gemini-api-url.com").build();
    }


    public String processAudio(byte[] audioBytes, String fileName) {
        return webClient.post()
                .uri("/process-audio")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", new ByteArrayResource(audioBytes) {
                    @Override
                    public String getFilename() {
                        return fileName;
                    }
                }))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}

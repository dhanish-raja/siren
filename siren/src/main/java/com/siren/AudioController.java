package com.siren;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audio")
public class AudioController {
    private final AudioService audioService;

    public AudioController(AudioService audioService) {
        this.audioService = audioService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadAudio(@RequestParam("url") String fileUrl) {
        try {
            String fileId = audioService.saveAudioFromUrl(fileUrl);

            String result = audioService.sendToGeminiFromUrl(fileUrl);

            return ResponseEntity.ok("File saved with ID: " + fileId + "\nGemini Response: " + result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}

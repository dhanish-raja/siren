//package com.siren;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/audio")
//@CrossOrigin(origins ={ "http://localhost:8080","null"})
//public class AudioController {
//    private final AudioService audioService;
//
//    public AudioController(AudioService audioService) {
//        this.audioService = audioService;
//    }
//
//    @PostMapping("/upload")
//    public ResponseEntity<String> uploadAudio(@RequestParam("url") String fileUrl) {
//        try {
//            String fileId = audioService.saveAudioFromUrl(fileUrl);
//
//            String result = audioService.sendToGeminiFromUrl(fileUrl);
//
//            return ResponseEntity.ok("File saved with ID: " + fileId + "\nGemini Response: " + result);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error: " + e.getMessage());
//        }
//    }
//}


package com.siren;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080", "null" }) // adjust frontend origin if needed
public class AudioController {

    private final AudioService audioService;

    public AudioController(AudioService audioService) {
        this.audioService = audioService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadAudio(@RequestParam("file") MultipartFile file) {
        try {
            // Save to DB
            String fileId = audioService.saveAudio(file);
            System.out.println("Saved to DB");

            // Send to Gemini
//            String result = audioService.sendToGemini(file);
            System.out.println("Sent to Gemini");

//            return ResponseEntity.ok("File saved with ID: " + fileId + "\nGemini Response: " + result);
            return ResponseEntity.ok("File saved with ID: " + fileId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}

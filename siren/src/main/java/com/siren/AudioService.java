//package com.siren;
//
//import org.springframework.stereotype.Service;
//
//import java.io.ByteArrayOutputStream;
//import java.io.IOException;
//import java.io.InputStream;
//import java.net.URL;
//
//@Service
//public class AudioService {
//
//    private final AudioRepository audioRepository;
//    private final GeminiClient geminiClient;
//
//    public AudioService(AudioRepository audioRepository, GeminiClient geminiClient) {
//        this.audioRepository = audioRepository;
//        this.geminiClient = geminiClient;
//    }
//
//    // Helper method to download file from URL into byte[]
//    private byte[] downloadFile(String fileUrl) throws IOException {
//        try (InputStream in = new URL(fileUrl).openStream();
//             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
//            byte[] data = new byte[1024];
//            int nRead;
//            while ((nRead = in.read(data, 0, data.length)) != -1) {
//                buffer.write(data, 0, nRead);
//            }
//            System.out.println("Audio file downloaded");
//            return buffer.toByteArray();
//        }
//    }
//
//    public String saveAudioFromUrl(String fileUrl) throws IOException {
//        byte[] fileData = downloadFile(fileUrl);
//
//        AudioEntity audio = new AudioEntity();
//        audio.setFileName(fileUrl.substring(fileUrl.lastIndexOf("/") + 1)); // extract filename from URL
//        audio.setContentType("audio/mpeg"); // or detect dynamically
//        audio.setData(fileData);
//
//        AudioEntity saved = audioRepository.save(audio);
//        System.out.println("Audio saved");
//        return saved.getId().toString();
//    }
//
//    public String sendToGeminiFromUrl(String fileUrl) throws IOException {
//        byte[] fileData = downloadFile(fileUrl);
//        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
//        return geminiClient.processAudio(fileData, fileName);
//    }
//}


package com.siren;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class AudioService {

    private final AudioRepository audioRepository;
    private final GeminiClient geminiClient;

    public AudioService(AudioRepository audioRepository, GeminiClient geminiClient) {
        this.audioRepository = audioRepository;
        this.geminiClient = geminiClient;
    }

    // Save Blob directly to DB
    public String saveAudio(MultipartFile file) throws IOException {
        AudioEntity audio = new AudioEntity();
        audio.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "recording.mp3");
        audio.setContentType(file.getContentType() != null ? file.getContentType() : "audio/mpeg");
        audio.setData(file.getBytes());

        AudioEntity saved = audioRepository.save(audio);
        System.out.println("Audio saved: " + saved.getFileName());
        return saved.getId().toString();
    }

    // Send Blob directly to Gemini
    public String sendToGemini(MultipartFile file) throws IOException {
        return geminiClient.processAudio(file.getBytes(),
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "recording.mp3");
    }
}

//let mediaRecorder;
//let audioChunks = [];
//
//document.getElementById("record").onclick = async (e) => {
//  e.preventDefault();
//  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//  mediaRecorder = new MediaRecorder(stream);
//  mediaRecorder.start();
//  mediaRecorder.ondataavailable = (e) => {
//    audioChunks.push(e.data);
//  };
//};
//
//    document.getElementById("send").onclick = async (e) => {
//        e.preventDefault();
//      // Example: this should be the permanent URL of your audio file
//      let fileUrl = "http://localhost:8080/uploads/recording.mp3";
//
//      let formData = new FormData();
//      formData.append("url", fileUrl);
//
//      try {
//        let response = await fetch("http://localhost:8080/api/audio/upload", {
//          method: "POST",
//          body: formData
//        });
//
//        let result = await response.text();
//        console.log("Server response:", result);
//        alert(result);
//      } catch (err) {
//        console.error("Upload failed:", err);
//      }
//    };


let mediaRecorder;
let audioChunks = [];

document.getElementById("record").onclick = async (e) => {
  e.preventDefault();
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };
};

document.getElementById("stop").onclick = async (e) => {
  e.preventDefault();
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    let blob = new Blob(audioChunks, { type: "audio/webm" }); // use webm (mp3 not guaranteed)
    let url = URL.createObjectURL(blob);

    // Local download link (optional)
    document.getElementById("download").href = url;
    document.getElementById("download").download = "recording.webm";
    document.getElementById("download").innerText = "Download Recording";

    // --- ✅ Send blob to backend ---
    let formData = new FormData();
    formData.append("file", blob, "recording.webm");


    try {
      let response = await fetch("http://localhost:8080/api/audio/upload", {
        method: "POST",
        body: formData
      });

      let result = await response.text();

      console.log("Upload success:", result);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    audioChunks = []; // reset after upload
        };
};

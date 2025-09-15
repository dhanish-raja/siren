let mediaRecorder;
let audioChunks = [];
let recordButton = document.getElementById("record");
let downloadLink = document.getElementById("download");
let isRecording = false;

recordButton.onclick = async (e) => {
  e.preventDefault();

  if (!isRecording) {
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
    isRecording = false;
    mediaRecorder.stop();

    mediaRecorder.onstop = async () => {
      let blob = new Blob(audioChunks, { type: "audio/webm" });
      let url = URL.createObjectURL(blob);

      downloadLink.href = url;
      downloadLink.download = "recording.webm";
      downloadLink.innerText = "Download Recording";

      let formData = new FormData();
      formData.append("file", blob, "recording.webm");

      try {
        let response = await fetch("http://localhost:8080/api/audio/upload", {
          method: "POST",
          body: formData
        });

        let result = await response.text();
        console.log("Upload success:", result);
        recordButton.style.backgroundColor = "grey";
        recordButton.innerText = "Sent !";

        setTimeout(() => {
          recordButton.style.backgroundColor = "green";
          recordButton.innerText = "Record";
        }, 2000);

      } catch (err) {
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

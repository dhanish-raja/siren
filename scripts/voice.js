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

document.getElementById("stop").onclick = (e) => {
  e.preventDefault();
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    let blob = new Blob(audioChunks, { type: "audio/mp3" });
    let url = URL.createObjectURL(blob);
    console.log(url);
    document.getElementById("download").href = url;
    document.getElementById("download").download = "recording.mp3";
    document.getElementById("download").innerText = "Download Recording";
  };
  audioChunks = [];
};
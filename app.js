let localStream;
let ws;

const micBtn = document.getElementById("micBtn");
const muteBtn = document.getElementById("muteBtn");

micBtn.onclick = async () => {

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  ws = new WebSocket(`wss://${location.host}`);

  const recorder = new MediaRecorder(localStream);

  recorder.ondataavailable = (event) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(event.data);
    }
  };

  recorder.start(200);
};

muteBtn.onclick = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  }
};
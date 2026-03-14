let localStream;
let ws;

const micBtn = document.getElementById("micBtn");
const muteBtn = document.getElementById("muteBtn");

micBtn.onclick = async () => {

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  ws = new WebSocket(`wss://${location.host}`);

  ws.onmessage = (event) => {
    const audio = new Audio();
    audio.srcObject = new MediaStream([event.data]);
    audio.play();
  };

  const recorder = new MediaRecorder(localStream);

  recorder.ondataavailable = (e) => {
    if (ws.readyState === 1) {
      ws.send(e.data);
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
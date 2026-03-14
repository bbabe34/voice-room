let socket;
let localStream;

const micBtn = document.getElementById("mic");
const muteBtn = document.getElementById("mute");

socket = new WebSocket(`wss://${location.host}`);

micBtn.onclick = async () => {

localStream = await navigator.mediaDevices.getUserMedia({audio:true});

console.log("Microphone connected");

};

muteBtn.onclick = () => {

if(localStream){
localStream.getTracks().forEach(track=>{
track.enabled = !track.enabled;
});
}

};
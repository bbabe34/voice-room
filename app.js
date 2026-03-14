const joinBtn = document.getElementById("join");
const muteBtn = document.getElementById("mute");
const raiseBtn = document.getElementById("raiseHand");
const giftBtn = document.getElementById("gift");

const roomInput = document.getElementById("roomId");
const nameInput = document.getElementById("username");

const statusText = document.getElementById("status");
const userList = document.getElementById("users");

const seats = document.querySelectorAll(".seat");

const diamondsText = document.getElementById("diamonds");

let diamonds = 0;

const socket = new WebSocket("ws://localhost:3000");

let localStream;
let peer;
let audio = document.createElement("audio");
audio.autoplay = true;



joinBtn.onclick = async () => {

const room = roomInput.value || "general";
const name = nameInput.value || "User";

localStream = await navigator.mediaDevices.getUserMedia({audio:true});

statusText.innerText = "Microphone connected 🎤";

peer = new RTCPeerConnection();

localStream.getTracks().forEach(track=>{
peer.addTrack(track,localStream);
});

peer.ontrack = event=>{
audio.srcObject = event.streams[0];
};

peer.onicecandidate = event=>{
if(event.candidate){

socket.send(JSON.stringify({
type:"candidate",
candidate:event.candidate
}));

}
};

socket.send(JSON.stringify({
type:"join",
room:room,
name:name
}));

const offer = await peer.createOffer();
await peer.setLocalDescription(offer);

socket.send(JSON.stringify({
type:"offer",
offer:offer
}));


/* speaking detection */

const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const microphone = audioContext.createMediaStreamSource(localStream);

microphone.connect(analyser);

const data = new Uint8Array(analyser.frequencyBinCount);

function detectSpeaking(){

analyser.getByteFrequencyData(data);

let volume = data.reduce((a,b)=>a+b)/data.length;

seats.forEach(seat=>{

if(seat.innerText === name){

seat.classList.toggle("speaking", volume > 20);

}

});

requestAnimationFrame(detectSpeaking);

}

detectSpeaking();

};



muteBtn.onclick = ()=>{

if(!localStream) return;

const track = localStream.getAudioTracks()[0];

track.enabled = !track.enabled;

statusText.innerText =
track.enabled ? "Mic ON 🎤" : "Mic Muted 🔇";

};



raiseBtn.onclick = ()=>{

socket.send(JSON.stringify({
type:"raiseHand"
}));

};



giftBtn.onclick = ()=>{

socket.send(JSON.stringify({
type:"gift",
amount:1
}));

};



socket.onmessage = async message =>{

const data = JSON.parse(message.data);



if(data.type === "offer"){

peer = new RTCPeerConnection();

localStream.getTracks().forEach(track=>{
peer.addTrack(track,localStream);
});

peer.ontrack = event=>{
audio.srcObject = event.streams[0];
};

await peer.setRemoteDescription(data.offer);

const answer = await peer.createAnswer();
await peer.setLocalDescription(answer);

socket.send(JSON.stringify({
type:"answer",
answer:answer
}));

}



if(data.type === "answer"){
await peer.setRemoteDescription(data.answer);
}



if(data.type === "candidate"){
await peer.addIceCandidate(data.candidate);
}



if(data.type === "roomUpdate"){

userList.innerHTML = "";

data.users.forEach(user=>{
const li = document.createElement("li");
li.innerText = user;
userList.appendChild(li);
});

data.seats.forEach((name,index)=>{
seats[index].innerText = name ? name : "Empty";
});

if(data.host === nameInput.value){
statusText.innerText = "👑 You are the host";
}

}



if(data.type === "handRaised"){

const li = document.createElement("li");
li.innerText = data.name + " raised hand ✋";

userList.appendChild(li);

}



if(data.type === "gift"){

diamonds += data.amount;

diamondsText.innerText = diamonds;

}

};



seats.forEach((seat,index)=>{

seat.onclick = ()=>{

socket.send(JSON.stringify({
type:"takeSeat",
seat:index
}));

};

});
const WebSocket = require("ws");

const server = new WebSocket.Server({port:3000});

let rooms = {};

server.on("connection",socket=>{

socket.on("message",message=>{

const data = JSON.parse(message);



if(data.type === "join"){

socket.room = data.room;
socket.name = data.name;

if(!rooms[socket.room]){

rooms[socket.room] = {
users:[],
seats:Array(8).fill(null),
host:socket.name
};

}

rooms[socket.room].users.push(socket);

updateRoom(socket.room);

return;

}



if(data.type === "takeSeat"){

const room = rooms[socket.room];

if(!room) return;

const seatIndex = data.seat;

if(!room.seats[seatIndex]){

room.seats[seatIndex] = socket.name;

updateRoom(socket.room);

}

}



if(data.type === "raiseHand"){

const room = rooms[socket.room];

room.users.forEach(client=>{

client.send(JSON.stringify({
type:"handRaised",
name:socket.name
}));

});

}



if(data.type === "gift"){

const room = rooms[socket.room];

room.users.forEach(client=>{

client.send(JSON.stringify({
type:"gift",
amount:data.amount
}));

});

}



if(socket.room && rooms[socket.room]){

rooms[socket.room].users.forEach(client=>{

if(client !== socket && client.readyState === WebSocket.OPEN){

client.send(JSON.stringify(data));

}

});

}

});


socket.on("close",()=>{

if(!socket.room) return;

const room = rooms[socket.room];

room.users = room.users.filter(c=>c !== socket);

room.seats = room.seats.map(seat =>
seat === socket.name ? null : seat
);

updateRoom(socket.room);

});

});


function updateRoom(roomName){

const room = rooms[roomName];

const users = room.users.map(c=>c.name);

room.users.forEach(client=>{

client.send(JSON.stringify({
type:"roomUpdate",
users:users,
seats:room.seats,
host:room.host
}));

});

}

console.log("Signaling server running on port 3000");
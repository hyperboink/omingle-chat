const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const hasRoomExceed = (room, limit) => io.sockets.adapter.rooms.get(room).size >= limit;
const hasRoomExceedByPair = room => hasRoomExceed(room, 2);
let index = 1;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/app.html');
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        io.to(socket.currentRoom).emit('chat:disconnected');
    });

    socket.on('chat:matching', () => {
        let room = "room:" + index;

        socket.join(room);
        socket.currentRoom = room;

        if(hasRoomExceedByPair(socket.currentRoom)){
            io.in(socket.currentRoom).emit('room:created', {
                message: `<div class="intro">You can start chatting now.</div>`
            });

            index++;
        }
    });

    socket.on('send-message', (data) => {
        if(hasRoomExceedByPair(socket.currentRoom)){
            socket.to(socket.currentRoom).emit('receive-message', data);
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running!');
});
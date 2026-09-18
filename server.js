const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(path.join(__dirname, 'public')));

let waitingUser = null;
let onlineUsersCount = 0;

function pairUsers(socket) {
    if (waitingUser && waitingUser.id !== socket.id) {
        const room = `room_${socket.id}_${waitingUser.id}`;
        
        socket.join(room);
        waitingUser.join(room);

        socket.room = room;
        waitingUser.room = room;

        io.to(room).emit('chat_start', 'You are now connected with a random stranger!');
        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit('waiting', 'Looking for an available stranger...');
    }
}

function leaveRoom(socket) {
    if (waitingUser && waitingUser.id === socket.id) {
        waitingUser = null;
    }
    
    if (socket.room) {
        socket.to(socket.room).emit('stranger_left', 'Stranger has disconnected.');
        
        const roomSockets = io.sockets.adapter.rooms.get(socket.room);
        if (roomSockets) {
            for (const socketId of roomSockets) {
                const clientSocket = io.sockets.sockets.get(socketId);
                if (clientSocket) {
                    clientSocket.leave(socket.room);
                    clientSocket.room = null;
                }
            }
        }
        socket.room = null;
    }
}

io.on('connection', (socket) => {
    onlineUsersCount++;
    io.emit('update_user_count', onlineUsersCount);

    pairUsers(socket);

    socket.on('send_message', (msg) => {
        if (socket.room) {
            socket.to(socket.room).emit('receive_message', msg);
        }
    });

    socket.on('typing', (isTyping) => {
        if (socket.room) {
            socket.to(socket.room).emit('display_typing', isTyping);
        }
    });

    socket.on('next_user', () => {
        leaveRoom(socket);
        pairUsers(socket);
    });

    socket.on('disconnect', () => {
        onlineUsersCount = Math.max(0, onlineUsersCount - 1);
        io.emit('update_user_count', onlineUsersCount);
        leaveRoom(socket);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit('waiting', 'Dusre user ka wait ho raha hai...');
    }

    // Messages forwarding
    socket.on('send_message', (msg) => {
        if (socket.room) {
            socket.to(socket.room).emit('receive_message', msg);
        }
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (waitingUser === socket) {
            waitingUser = null;
        } else if (socket.room) {
            io.to(socket.room).emit('stranger_left', 'Stranger ne chat chhod di hai.');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully running on port ${PORT}`);
});

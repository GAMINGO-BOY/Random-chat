const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS enabled
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Static files serve karne ke liye 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Users ko aapas mein pair/match karna
    if (waitingUser && waitingUser.id !== socket.id) {
        const room = `room_${socket.id}_${waitingUser.id}`;
        
        socket.join(room);
        waitingUser.join(room);

        socket.room = room;
        waitingUser.room = room;

        io.to(room).emit('chat_start', 'Aap ek stranger se connect ho gaye hain!');
        
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

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

let queue = [];

function getOnlineCount() {
    return io.sockets.sockets.size;
}

function matchUsers() {
    while (queue.length >= 2) {
        const socket1 = queue.shift();
        const socket2 = queue.shift();

        if (socket1.connected && socket2.connected) {
            const roomId = `room_${socket1.id}_${socket2.id}`;
            socket1.join(roomId);
            socket2.join(roomId);

            socket1.roomId = roomId;
            socket2.roomId = roomId;

            socket1.emit('partner_found', 'Connected with a random stranger!');
            socket2.emit('partner_found', 'Connected with a random stranger!');
        }
    }
}

function disconnectPartner(socket) {
    if (socket.roomId) {
        socket.to(socket.roomId).emit('partner_left', 'Stranger has disconnected.');
        socket.leave(socket.roomId);
        socket.roomId = null;
    }
    queue = queue.filter(s => s.id !== socket.id);
}

io.on('connection', (socket) => {
    io.emit('online_count', getOnlineCount());

    // Auto add to queue on connection
    queue.push(socket);
    socket.emit('waiting', 'Searching for a stranger...');
    matchUsers();

    socket.on('send_chat', (message) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('receive_chat', message);
        }
    });

    socket.on('skip_chat', () => {
        disconnectPartner(socket);
        queue.push(socket);
        socket.emit('waiting', 'Searching for a new stranger...');
        matchUsers();
    });

    socket.on('disconnect', () => {
        disconnectPartner(socket);
        io.emit('online_count', getOnlineCount());
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
        socket.to(socket.room).emit('stranger_left', 'Stranger has left the chat.');
        
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
    broadcastOnlineCount();

    if (!waitingQueue.includes(socket.id)) {
        waitingQueue.push(socket.id);
    }
    
    socket.emit('waiting', 'Looking for a stranger...');
    matchUsers();

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
        if (!waitingQueue.includes(socket.id)) {
            waitingQueue.push(socket.id);
        }
        socket.emit('waiting', 'Looking for a new stranger...');
        matchUsers();
    });

    socket.on('disconnect', () => {
        leaveRoom(socket);
        broadcastOnlineCount();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
        const socket1 = io.sockets.sockets.get(id1);
        const socket2 = io.sockets.sockets.get(id2);

        if (socket1 && socket2) {
            const room = `room_${id1}_${id2}`;
            socket1.join(room);
            socket2.join(room);

            socket1.room = room;
            socket2.room = room;

            io.to(room).emit('chat_start', 'You are now connected with a stranger!');
        } else if (socket1) {
            waitingQueue.unshift(id1);
        } else if (socket2) {
            waitingQueue.unshift(id2);
        }
    }
}

function leaveRoom(socket) {
    removeFromQueue(socket.id);

    if (socket.room) {
        socket.to(socket.room).emit('stranger_left', 'Stranger has left the chat.');
        
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
    broadcastOnlineCount();

    // Automatically queue the user on connect
    if (!waitingQueue.includes(socket.id)) {
        waitingQueue.push(socket.id);
    }
    
    socket.emit('waiting', 'Looking for a stranger...');
    matchUsers();

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
        if (!waitingQueue.includes(socket.id)) {
            waitingQueue.push(socket.id);
        }
        socket.emit('waiting', 'Looking for a new stranger...');
        matchUsers();
    });

    socket.on('disconnect', () => {
        leaveRoom(socket);
        broadcastOnlineCount();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
            socket1.join(room);
            socket2.join(room);

            socket1.room = room;
            socket2.room = room;

            socket1.partnerId = id2;
            socket2.partnerId = id1;

            io.to(room).emit('chat_start', 'You are now connected with a stranger!');
        } else if (socket1) {
            waitingQueue.unshift(id1);
        } else if (socket2) {
            waitingQueue.unshift(id2);
        }
    }
}

function leaveRoom(socket) {
    removeFromQueue(socket.id);

    if (socket.room) {
        socket.to(socket.room).emit('stranger_left', 'Stranger has left the chat.');
        
        const roomSockets = io.sockets.adapter.rooms.get(socket.room);
        if (roomSockets) {
            for (const socketId of roomSockets) {
                const clientSocket = io.sockets.sockets.get(socketId);
                if (clientSocket) {
                    clientSocket.leave(socket.room);
                    clientSocket.room = null;
                    clientSocket.partnerId = null;
                }
            }
        }
        socket.room = null;
        socket.partnerId = null;
    }
}

io.on('connection', (socket) => {
    // Connection par instant updated count sabhi clients ko bhejna
    broadcastOnlineCount();

    waitingQueue.push(socket.id);
    socket.emit('waiting', 'Looking for a stranger...');
    matchUsers();

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
        if (!waitingQueue.includes(socket.id)) {
            waitingQueue.push(socket.id);
        }
        socket.emit('waiting', 'Looking for a new stranger...');
        matchUsers();
    });

    socket.on('disconnect', () => {
        leaveRoom(socket);
        // Disconnect par updated count broadcast karna
        broadcastOnlineCount();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
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

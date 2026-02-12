const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
// const io = new Server(server);

app.use(cors({ origin: "*"}));

// Ye Socket.io connection ke liye hota hai (WebSocket).

// Socket.io normal HTTP request nahi hota — ye alag protocol use karta hai.

// Isliye Socket.io ko bhi separately batana padta hai:
const io = new Server(server, {
  cors: {
    origin: "*",   // sab origin allow karega
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('messageSend', (msg) => {
    console.log('message In backend:', msg);
    io.emit('message_Distributed_by server', msg);
  });

  socket.on('disconnect', () => {
    console.log('user Disconnected');
  });
});

// 👇 YE IMPORTANT HAI — bahar hona chahiye
server.listen(port, () => {
  console.log(`Socket server working On ${port}`);
});

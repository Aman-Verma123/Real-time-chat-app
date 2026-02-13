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

// const users = {};


// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('messageSend', (msg) => {
//     console.log('message In backend:', msg);
//     io.emit('message_Distributed_by server', msg);
//   });

//   socket.on('disconnect', () => {
//     console.log('user Disconnected');
//   });
// });

const users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 👇 Jab username aaye
  socket.on("setUsername", (username) => {
    users[socket.id] = username;

    console.log("Username saved:", username);

    // Optional: sabko batao user join hua
    io.emit("message_Distributed_by server", {
      name: "System",
      message: `${username} joined the chat`
    });
  });

  // // 👇 Jab message aaye
  // socket.on('messageSend', (msg) => {

  //   const username = users[socket.id];

  //   io.emit('message_Distributed_by server', {
  //     name: username,
  //     message: msg
  //   });
  // });
socket.on('messageSend', (msg) => {

  const username = users[socket.id];

  if (!username) {
    console.log("Username not set yet!");
    return;
  }

  if (!msg) return;

  io.emit('message_Distributed_by server', {
    name: username,
    message: msg
  });
});




  // 👇 Disconnect hone par
  socket.on('disconnect', () => {

    const username = users[socket.id];

    if (username) {
      io.emit("message_Distributed_by server", {
        name: "System",
        message: `${username} left the chat`
      });

      delete users[socket.id];
    }

    console.log('User Disconnected:', socket.id);
  });
});


// 👇 YE IMPORTANT HAI — bahar hona chahiye
server.listen(port, () => {
  console.log(`Socket server working On ${port}`);
});

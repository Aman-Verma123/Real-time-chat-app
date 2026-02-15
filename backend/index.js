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
// app.use(express.static("public"));
const path = require("path");



// app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/sounds", express.static(path.join(__dirname, "sounds")));



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



  // 👇 Set Username
  socket.on("setUsername", (username) => {
    users[socket.id] = username;

    
    // sidebar ke liye sabko users ki list bhejna
  io.emit("users-update", Object.values(users));


    // console.log("Username saved:", username);
    // Optional: sabko batao user join hua
    // io.broadcast.emit("message_Distributed_by server", { io nhi socket hoga
    socket.broadcast.emit("message_Distributed_by server", {
      name: "🔔notification",
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
    message: msg,
    senderId: socket.id,
    time: new Date().toISOString()  
//     new Date() → abhi ka time and toISOString() → clean standard format
  });
});
// typing indicator ke liye event............................
socket.on('typing', () => {
  const username = users[socket.id];

  socket.broadcast.emit('userTyping', {
    username
  });
});


socket.on('stopTyping', () => {
  socket.broadcast.emit('userStopTyping');
});



// ...........................................................
socket.on('disconnect', () => {

  const username = users[socket.id];

  if (username) {
    // 🔥 pehle user remove karo
    delete users[socket.id];

    // 🔥 fir updated list bhejo
    io.emit("users-update", Object.values(users));
    // object → simple array of usernames

    // optional: leave message
    io.emit("message_Distributed_by server", {
      name: "leave",
      message: `${username} left the chat`
    });
  }

  console.log('User Disconnected:', socket.id);
});
});

// 👇 YE IMPORTANT HAI — bahar hona chahiye
server.listen(port, () => {
  console.log(`Socket server working On ${port}`);
});


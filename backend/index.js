const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
// const mongoose = require("mongoose");
const connectDB = require("./config/db");
// const path = require("path");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);
connectDB();

//----------------deployement------------------
// if(process.env.NODE_ENV == "production"){
//   app.use(express.static("frontend/build"));
//   const path = require("path");
//   app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname, 'frontend','build','index.html'));
//   })
// }


//----------------deployement------------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});

const io = socket(server, {
  cors: {
    orgin: "http://localhost:3000",
    credentials: true,
  },
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

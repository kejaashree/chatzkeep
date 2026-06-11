const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/uploads");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Socket.io
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user:join", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online`);
  });

  socket.on("message:send", async (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:receive", message);
      // Also send notification
      io.to(receiverSocketId).emit("notification:new", {
        type: "message",
        from: message.sender,
        content: message.content,
        createdAt: new Date(),
      });
    }
  });

  socket.on("message:typing", ({ receiverId, senderId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:typing", { senderId });
    }
  });

  socket.on("message:stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:stopTyping", { senderId });
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userId} went offline`);
    }
  });
});

// Make io accessible in routes
app.set("io", io);

// MongoDB connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

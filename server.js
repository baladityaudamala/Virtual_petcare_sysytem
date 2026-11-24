
const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();

// Database and models
const {
  sequelize,
  Chat,
  ChatMessage,
  ChatParticipant,
  ChatUnreadCount,
} = require("./models/index");

const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:3000"]
    : []),
].filter(Boolean);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan("dev"));

// Health check for Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Virtual Pet Care API is running",
  });
});

// Backend home route
app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.sendFile(
      path.join(__dirname, "client", "build", "index.html")
    );
  }

  res.status(200).json({
    message: "Virtual Pet Care Backend is running!",
  });
});

// Application routes
app.use("/users", require("./routes/userRoutes"));
app.use("/confirm", require("./routes/confirmRoutes"));
app.use("/api", require("./routes/petRoutes"));
app.use("/api", require("./routes/imgLocRoutes"));

app.use(
  "/images",
  express.static(path.join(__dirname, "client/public/images"))
);

app.use("/api", require("./routes/pushRoutes"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/chats", require("./routes/chatRoutes"));

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "client", "build");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res, next) => {
    const apiPrefixes = [
      "/users",
      "/confirm",
      "/api",
      "/posts",
      "/chats",
      "/health",
      "/images",
    ];

    if (
      apiPrefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`)
      )
    ) {
      return next();
    }

    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Socket.IO server
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Connected to Socket.IO:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData || !userData.id) return;

    socket.join(String(userData.id));
    socket.emit("connected");
  });

  socket.on("join_room", (roomId) => {
    if (!roomId) return;

    socket.join(String(roomId));
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    if (!data) return;

    const { roomId, senderId, text } = data;

    if (!roomId || !senderId || !text) return;

    try {
      const chat = await Chat.findByPk(roomId);

      if (!chat) return;

      // Save message
      const newMessage = await ChatMessage.create({
        chatId: roomId,
        senderId,
        text,
      });

      // Update latest chat message
      await chat.update({
        lastMessage: text,
        lastMessageDate: new Date(),
      });

      // Find chat participants
      const participants = await ChatParticipant.findAll({
        where: { chatId: roomId },
      });

      // Update unread counts and notify other participants
      for (const cp of participants) {
        if (String(cp.userId) !== String(senderId)) {
          const existing = await ChatUnreadCount.findOne({
            where: {
              chatId: roomId,
              userId: String(cp.userId),
            },
          });

          if (existing) {
            await existing.update({
              count: existing.count + 1,
            });
          } else {
            await ChatUnreadCount.create({
              chatId: roomId,
              userId: String(cp.userId),
              count: 1,
            });
          }

          io.to(String(cp.userId)).emit("notification", {
            chatId: roomId,
            senderId,
            text,
          });
        }
      }

      // Broadcast message to chat room
      io.to(String(roomId)).emit("receive_message", {
        id: newMessage.id,
        _id: newMessage.id,
        chatId: roomId,
        senderId,
        text,
        createdAt: newMessage.createdAt,
      });
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Connect to TiDB and start backend
async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("MySQL connection established.");

    // Create missing tables without altering existing tables
    await sequelize.sync();

    console.log("Database synchronization completed.");

    // Start scheduled tasks after database connection
    const { startScheduler } = require("./cron/scheduler");
    startScheduler();

    // Start Express and Socket.IO
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Backend startup error:", err);
    process.exit(1);
  }
}

startServer();

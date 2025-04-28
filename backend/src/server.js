const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const routes = require("./routes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const messageRoutes = require("./routes/message.routes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const disputeRoutes = require("./routes/dispute.routes");
const shoppingCartRoutes = require("./routes/shippingCartRoutes");
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, you should restrict this to your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);
app.use("/auth", require("./routes/auth.routes"));
app.use("/products", productRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/categories", categoryRoutes);
app.use("/messages", messageRoutes);
app.use("/reviews", reviewRoutes);
app.use("/disputes", disputeRoutes);
app.use("/shoppingCart", shoppingCartRoutes);
// Socket.io connection handling
const connectedUsers = {};

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  // Handle user joining
  socket.on("userJoin", (userId) => {
    connectedUsers[userId] = socket.id;
    logger.info(`User ${userId} joined with socket id ${socket.id}`);
    socket.join(userId); // Join a room with the user's ID
  });

  // Handle user leaving
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
    // Remove user from connectedUsers
    for (const [userId, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[userId];
        logger.info(`User ${userId} disconnected`);
        break;
      }
    }
  });

  // Handle sending a private message
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, content, productId } = data;

      // Create message in database
      const Message = require("./models/Message");
      const messageData = { senderId, receiverId, content };

      // Add product reference if provided
      if (productId) {
        messageData.productId = productId;
      }

      const message = new Message(messageData);
      await message.save();

      // Populate sender info
      const User = require("./models/User");
      const sender = await User.findById(senderId).select("username fullname");

      // Populate product info if applicable
      let productInfo = null;
      if (productId) {
        const Product = require("./models/Product");
        productInfo = await Product.findById(productId).select(
          "title image price"
        );
      }

      // Prepare message for sending
      const messageToSend = {
        ...message.toObject(),
        sender,
        product: productInfo,
      };

      // Send to receiver if online
      if (connectedUsers[receiverId]) {
        socket
          .to(connectedUsers[receiverId])
          .emit("receiveMessage", messageToSend);
      }

      // Send back to sender as confirmation
      socket.emit("messageSent", messageToSend);

      logger.info(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      logger.error("Error in sendMessage event:", error);
      socket.emit("messageError", { error: error.message });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { senderId, receiverId, productId } = data;
    if (connectedUsers[receiverId]) {
      socket.to(connectedUsers[receiverId]).emit("userTyping", {
        userId: senderId,
        productId,
      });
    }
  });

  // Handle stop typing indicator
  socket.on("stopTyping", (data) => {
    const { senderId, receiverId, productId } = data;
    if (connectedUsers[receiverId]) {
      socket.to(connectedUsers[receiverId]).emit("userStopTyping", {
        userId: senderId,
        productId,
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// Start server
const PORT = process.env.PORT || 9999;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };

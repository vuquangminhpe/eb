import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageListeners = [];
    this.typingListeners = [];
    this.connectionListeners = [];
  }

  connect(userId) {
    this.socket = io("http://localhost:5000");
    this.socket.on("connect", () => {
      console.log("Socket connected!");
      this.connected = true;
      this.socket.emit("userJoin", userId);
      this.connectionListeners.forEach((listener) => listener(true));
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected!");
      this.connected = false;
      this.connectionListeners.forEach((listener) => listener(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.connected = false;
      this.connectionListeners.forEach((listener) => listener(false, error));
    });
    this.socket.on("receiveMessage", (message) => {
      console.log("New message received:", message);
      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on("messageSent", (message) => {
      console.log("Message confirmed sent:", message);
      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on("messageError", (error) => {
      console.error("Message error:", error);
    });
    this.socket.on("userTyping", (data) => {
      console.log("User typing:", data);
      this.typingListeners.forEach((listener) => listener(data, true));
    });

    this.socket.on("userStopTyping", (data) => {
      console.log("User stopped typing:", data);
      this.typingListeners.forEach((listener) => listener(data, false));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  addMessageListener(callback) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  addTypingListener(callback) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  sendMessage(senderId, receiverId, content, productId) {
    if (!this.connected) {
      console.error("Socket not connected!");
      return false;
    }

    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    };

    if (productId) {
      messageData.productId = productId;
    }

    this.socket.emit("sendMessage", messageData);
    return true;
  }

  sendTyping(senderId, receiverId, productId) {
    if (!this.connected) return;

    this.socket.emit("typing", {
      senderId,
      receiverId,
      productId,
    });
  }

  sendStopTyping(senderId, receiverId, productId) {
    if (!this.connected) return;

    this.socket.emit("stopTyping", {
      senderId,
      receiverId,
      productId,
    });
  }

  isConnected() {
    return this.connected;
  }
}

const socketService = new SocketService();
export default socketService;

import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageListeners = [];
    this.typingListeners = [];
    this.connectionListeners = [];
    this._userId = null;
    this._typingTimeouts = {}; // Object để lưu timeout theo conversation
    this._lastMessageIds = new Set(); // Để theo dõi tin nhắn đã xử lý
  }

  connect(userId) {
    // Nếu đã kết nối với cùng userId, không kết nối lại
    if (this.socket && this.connected && this._userId === userId) {
      return;
    }

    this._userId = userId;

    // Ngắt kết nối cũ nếu có
    if (this.socket) {
      this.disconnect();
    }

    // Tạo kết nối socket mới với cấu hình đơn giản
    this.socket = io("http://localhost:9999");

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
      // Kiểm tra tin nhắn trùng lặp
      if (message._id && this._lastMessageIds.has(message._id)) {
        return;
      }

      // Thêm id vào danh sách đã xử lý
      if (message._id) {
        this._lastMessageIds.add(message._id);
        // Giới hạn kích thước Set
        if (this._lastMessageIds.size > 200) {
          const iterator = this._lastMessageIds.values();
          const firstItem = iterator.next().value;
          this._lastMessageIds.delete(firstItem);
        }
      }

      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on("messageSent", (message) => {
      // Tương tự như xử lý receiveMessage
      if (message._id && this._lastMessageIds.has(message._id)) {
        return;
      }

      if (message._id) {
        this._lastMessageIds.add(message._id);
      }

      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on("messageError", (error) => {
      console.error("Message error:", error);
    });

    this.socket.on("userTyping", (data) => {
      this.typingListeners.forEach((listener) => listener(data, true));
    });

    this.socket.on("userStopTyping", (data) => {
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

    // Tránh gửi tin nhắn trùng lặp trong thời gian ngắn
    const messageKey = `${content}-${senderId}-${receiverId}-${Date.now()}`;
    if (this._lastMessageIds.has(messageKey)) {
      return true; // Xem như đã gửi thành công
    }
    this._lastMessageIds.add(messageKey);

    try {
      this.socket.emit("sendMessage", messageData);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  sendTyping(senderId, receiverId, productId) {
    if (!this.connected) return;

    const conversationKey = `${senderId}-${receiverId}-${
      productId || "noproduct"
    }`;

    // Xóa timeout đang có
    if (this._typingTimeouts[conversationKey]) {
      clearTimeout(this._typingTimeouts[conversationKey]);
    }

    // Chỉ gửi typing nếu chưa có thông báo gần đây
    if (!this._typingTimeouts[`sent-${conversationKey}`]) {
      this.socket.emit("typing", {
        senderId,
        receiverId,
        productId,
      });

      // Đánh dấu đã gửi, không gửi lại trong 2 giây
      this._typingTimeouts[`sent-${conversationKey}`] = setTimeout(() => {
        this._typingTimeouts[`sent-${conversationKey}`] = null;
      }, 2000);
    }

    // Set timeout để stop typing sau 3 giây không có thao tác
    this._typingTimeouts[conversationKey] = setTimeout(() => {
      this.sendStopTyping(senderId, receiverId, productId);
    }, 3000);
  }

  sendStopTyping(senderId, receiverId, productId) {
    if (!this.connected) return;

    const conversationKey = `${senderId}-${receiverId}-${
      productId || "noproduct"
    }`;

    // Xóa timeout nếu có
    if (this._typingTimeouts[conversationKey]) {
      clearTimeout(this._typingTimeouts[conversationKey]);
      this._typingTimeouts[conversationKey] = null;
    }

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

// Sử dụng singleton pattern để đảm bảo chỉ có một instance socketService
const socketService = new SocketService();
export default socketService;

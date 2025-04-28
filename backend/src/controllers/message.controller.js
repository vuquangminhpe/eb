const Message = require("../models/Message");

// Tạo tin nhắn mới
exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, productId } = req.body;
    const message = new Message({ senderId, receiverId, content, productId });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy cuộc trò chuyện giữa 2 người dùng
exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { productId } = req.query; // Thêm lọc theo productId

    let query = {
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    };

    // Nếu có productId, thêm vào điều kiện lọc
    if (productId) {
      query.productId = productId;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate("repliedTo")
      .populate({ path: "productId", select: "title image price" });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Lấy hộp thư đến
exports.getInbox = async (req, res) => {
  try {
    const { userId } = req.params;
    const inbox = await Message.find({ receiverId: userId })
      .populate("senderId", "username fullname")
      .populate({ path: "productId", select: "title image price" })
      .sort({ createdAt: -1 });
    res.status(200).json(inbox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tin nhắn đã gửi
exports.getSentMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const sent = await Message.find({ senderId: userId })
      .populate("receiverId", "username fullname")
      .populate({ path: "productId", select: "title image price" })
      .sort({ createdAt: -1 });
    res.status(200).json(sent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trả lời tin nhắn
exports.replyToMessage = async (req, res) => {
  try {
    const { content, messageId, receiverId, productId } = req.body;
    const senderId = req.user._id || req.user.id; // lấy từ middleware xác thực

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ error: "Tin nhắn gốc không tồn tại." });
    }

    const replyMessage = new Message({
      senderId,
      receiverId,
      content,
      repliedTo: messageId,
      productId: productId || originalMessage.productId, // Sử dụng productId từ request hoặc tin nhắn gốc
    });

    await replyMessage.save();
    res.status(200).json(replyMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đánh dấu tin nhắn đã đọc
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Tin nhắn không tồn tại." });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách các cuộc trò chuyện
exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy tất cả tin nhắn liên quan đến người dùng
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "username fullname")
      .populate("receiverId", "username fullname")
      .populate({ path: "productId", select: "title image price" });

    // Tạo map để lưu trữ cuộc trò chuyện theo userId và productId
    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUserId =
        message.senderId._id.toString() === userId
          ? message.receiverId._id.toString()
          : message.senderId._id.toString();

      const productId = message.productId
        ? message.productId._id.toString()
        : "no-product";
      const key = `${otherUserId}-${productId}`;

      if (!conversationsMap.has(key)) {
        // Xác định người dùng khác trong cuộc trò chuyện
        const otherUser =
          message.senderId._id.toString() === userId
            ? message.receiverId
            : message.senderId;

        // Đếm số tin nhắn chưa đọc
        const unreadCount = await Message.countDocuments({
          senderId: otherUserId,
          receiverId: userId,
          read: false,
          ...(message.productId ? { productId: message.productId._id } : {}),
        });

        conversationsMap.set(key, {
          otherUser,
          product: message.productId,
          latestMessage: message,
          unreadCount,
        });
      }
    }

    // Chuyển map thành mảng và sắp xếp theo thời gian tin nhắn mới nhất
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.latestMessage.createdAt) -
        new Date(a.latestMessage.createdAt)
    );

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

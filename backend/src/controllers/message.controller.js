const Message = require("../models/Message");

// Tạo tin nhắn mới
exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = new Message({ senderId, receiverId, content });
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
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("repliedTo");
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
      .populate("senderId", "username")
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
      .populate("receiverId", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(sent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trả lời tin nhắn
exports.replyToMessage = async (req, res) => {
    console.log("req.user", req.user);
  try {
    const { content, messageId, receiverId } = req.body;
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
    });

    await replyMessage.save();
    res.status(200).json(replyMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

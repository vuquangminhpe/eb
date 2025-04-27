const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null }, // Để lưu ID của tin nhắn gốc nếu là phản hồi
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
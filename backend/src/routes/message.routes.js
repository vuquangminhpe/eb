const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Tạo tin nhắn mới
router.post("/", messageController.createMessage);

// Lấy cuộc trò chuyện giữa 2 người dùng (hỗ trợ lọc theo productId qua query parameter)
router.get("/conversation/:user1/:user2", messageController.getConversation);

// Lấy danh sách các cuộc trò chuyện của người dùng
router.get("/conversations/:userId", messageController.getConversations);

// Lấy hộp thư đến
router.get("/inbox/:userId", messageController.getInbox);

// Lấy tin nhắn đã gửi
router.get("/sent/:userId", messageController.getSentMessages);

// Trả lời tin nhắn
router.post("/reply", authMiddleware, messageController.replyToMessage);

// Đánh dấu tin nhắn đã đọc
router.patch(
  "/:messageId/read",
  authMiddleware,
  messageController.markMessageAsRead
);

module.exports = router;

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Create a new order
router.post("/", authMiddleware, orderController.createOrder);

// Get all orders for current user
router.get("/", authMiddleware, orderController.getUserOrders);

// Get a specific order by ID
router.get("/:id", authMiddleware, orderController.getOrderById);

// Cancel an order
router.patch("/:id/cancel", authMiddleware, orderController.cancelOrder);

module.exports = router;

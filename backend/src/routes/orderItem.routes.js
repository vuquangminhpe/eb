const express = require("express");
const router = express.Router();
const OrderItemController = require("../controllers/orderItem.controller");

router.post("/create", OrderItemController.createOrderItem);
router.get("/all", OrderItemController.getAllOrderItems);
router.get("/seller/:sellerId", OrderItemController.getOrderItemBySellerId);
router.get("/statistic/:sellerId", OrderItemController.getOrderItemForStatistic);
router.put("/update/:id", OrderItemController.updateOrderItem);
router.delete("/delete/:id", OrderItemController.deleteOrderItem);

module.exports = router;
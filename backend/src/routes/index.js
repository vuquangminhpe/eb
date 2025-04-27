const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const storeRoutes = require("./store.routes");
const CouponRoutes = require("./coupon.routes");
const ProductRoutes = require("./product.routes");
const OrderItemRoutes = require("./orderItem.routes");
const ShippingInfoRoutes = require("./shippingInfo.routes");
const adminRoutes = require("./admin.routes");

// Auth routes
router.use("/auth", authRoutes);

// Store routes
router.use("/stores", storeRoutes); // Add store routes

// Coupon routes
router.use("/coupons", CouponRoutes);

// Product routes
router.use("/products", ProductRoutes);

// OrderItem routes
router.use("/orderItems", OrderItemRoutes);

// ShippingInfo routes
router.use("/shippingInfos", ShippingInfoRoutes);

// Admin routes
router.use("/admin", adminRoutes);

module.exports = router;

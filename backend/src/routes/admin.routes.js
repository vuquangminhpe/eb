const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");
const adminController = require("../controllers/admin.controller");

// User Management
router.get("/users", authMiddleware, isAdmin, adminController.getAllUsers);
router.post("/users", authMiddleware, isAdmin, adminController.createUser);
router.get("/users/:id", authMiddleware, isAdmin, adminController.getUserById);
router.put("/users/:id", authMiddleware, isAdmin, adminController.updateUser);
router.delete(
  "/users/:id",
  authMiddleware,
  isAdmin,
  adminController.deleteUser
);
router.patch(
  "/users/:id/toggle",
  authMiddleware,
  isAdmin,
  adminController.toggleUserStatus
);

// Category Management
router.get(
  "/categories",
  authMiddleware,
  isAdmin,
  adminController.getAllCategories
);
router.post(
  "/categories",
  authMiddleware,
  isAdmin,
  adminController.createCategory
);
router.get(
  "/categories/:id",
  authMiddleware,
  isAdmin,
  adminController.getCategoryById
);
router.put(
  "/categories/:id",
  authMiddleware,
  isAdmin,
  adminController.updateCategory
);
router.delete(
  "/categories/:id",
  authMiddleware,
  isAdmin,
  adminController.deleteCategory
);

// Product Management
router.get(
  "/products",
  authMiddleware,
  isAdmin,
  adminController.getAllProducts
);
router.post(
  "/products",
  authMiddleware,
  isAdmin,
  adminController.createProduct
);
router.get(
  "/products/:id",
  authMiddleware,
  isAdmin,
  adminController.getProductById
);
router.put(
  "/products/:id",
  authMiddleware,
  isAdmin,
  adminController.updateProduct
);
router.delete(
  "/products/:id",
  authMiddleware,
  isAdmin,
  adminController.deleteProduct
);

// Order Management
router.get("/orders", authMiddleware, isAdmin, adminController.getAllOrders);
router.get(
  "/orders/:id",
  authMiddleware,
  isAdmin,
  adminController.getOrderById
);
router.put(
  "/orders/:id",
  authMiddleware,
  isAdmin,
  adminController.updateOrderStatus
);

// Store Management
router.get("/stores", authMiddleware, isAdmin, adminController.getAllStores);
router.patch(
  "/stores/:id/approve",
  authMiddleware,
  isAdmin,
  adminController.approveStore
);
router.patch(
  "/stores/:id/reject",
  authMiddleware,
  isAdmin,
  adminController.rejectStore
);
router.get(
  "/orders/:id",
  authMiddleware,
  isAdmin,
  adminController.getOrderById
);
router.put(
  "/orders/:id",
  authMiddleware,
  isAdmin,
  adminController.updateOrderStatus
);

module.exports = router;

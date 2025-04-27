const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { isSeller } = require("../middleware/role.middleware"); // Import role middleware

// Get store profile (Seller only)
router.get(
  "/profile",
  authMiddleware,
  isSeller,
  storeController.getStoreProfile
);

// Update store profile (Seller only)
router.put(
  "/profile",
  authMiddleware,
  isSeller,
  storeController.updateStoreProfile
);

module.exports = router;

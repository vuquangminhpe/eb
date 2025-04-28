const express = require("express");
const router = express.Router();
const shoppingCartController = require("../controllers/shoppingCartController");

// Get cart(s) for a user
router.get("/", shoppingCartController.getUserCart);

// Create new cart
router.post("/", shoppingCartController.createCart);

// Update cart
router.patch("/:id", shoppingCartController.updateCart);

// Delete cart
router.delete("/:id", shoppingCartController.deleteCart);

module.exports = router;

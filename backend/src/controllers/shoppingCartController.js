const ShoppingCart = require("../models/ShoppingCart");
const logger = require("../utils/logger");

// Get shopping cart for a user
exports.getUserCart = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const carts = await ShoppingCart.find({ userId }).populate({
      path: "productId.idProduct",
      select: "title price image description",
    });

    res.json(carts);
  } catch (err) {
    logger.error("Get user cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new shopping cart
exports.createCart = async (req, res) => {
  try {
    const { userId, productId, dateAdded } = req.body;

    // Check if cart already exists for this user
    const existingCart = await ShoppingCart.findOne({ userId });
    if (existingCart) {
      return res.status(400).json({
        error: "Cart already exists for this user. Use PATCH to update it.",
      });
    }

    const newCart = new ShoppingCart({
      userId,
      productId: productId || [],
      dateAdded: dateAdded || new Date(),
    });

    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (err) {
    logger.error("Create cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update cart (add/update products)
exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product information is required" });
    }

    const updatedCart = await ShoppingCart.findByIdAndUpdate(
      id,
      { productId },
      { new: true }
    ).populate({
      path: "productId.idProduct",
      select: "title price image description",
    });

    if (!updatedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json(updatedCart);
  } catch (err) {
    logger.error("Update cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete cart
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCart = await ShoppingCart.findByIdAndDelete(id);

    if (!deletedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    logger.error("Delete cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

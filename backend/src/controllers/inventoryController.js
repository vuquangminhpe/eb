// controllers/inventoryController.js
const Inventory = require("../models/Inventory");

exports.updateInventory = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const updated = await Inventory.findOneAndUpdate(
      { productId },
      { $set: { quantity, lastUpdated: new Date() } },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Ensure quantity is a valid number
    if (quantity == null || quantity < 0) {
      return res.status(400).json({ error: "Quantity must be greater than or equal to 0" });
    }

    // Create the inventory record for the product
    const inventory = await Inventory.create({ productId, quantity });

    if (!inventory) {
      return res.status(500).json({ error: "Unable to create inventory record" });
    }

    res.status(201).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getInventoryByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: "No inventory found." });
    }
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().populate("productId");
    res.json(inventories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

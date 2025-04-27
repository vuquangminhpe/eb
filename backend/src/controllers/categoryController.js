const Category = require("../models/Category");
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
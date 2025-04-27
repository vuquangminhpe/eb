const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        logger.error("Get all products error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products",
            error: error.message,
        });
    }
};

const getProductBySellerId = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const products = await Product.find({ sellerId });
        res.status(200).json(products);
    } catch (error) {
        logger.error("Get products by seller ID error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products by seller ID",
            error: error.message,
        });
    }
};

module.exports = {
    getAllProducts,
    getProductBySellerId,
};
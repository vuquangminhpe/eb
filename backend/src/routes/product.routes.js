const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");

router.get("/all", ProductController.getAllProducts);

router.get("/seller/:sellerId", ProductController.getProductBySellerId);

module.exports = router;
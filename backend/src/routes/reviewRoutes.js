const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// GET /api/reviews/product/:productId
router.get("/product/:productId", reviewController.getReviewsByProduct);

module.exports = router;

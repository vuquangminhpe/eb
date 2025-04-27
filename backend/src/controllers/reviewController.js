const Review = require("../models/Review");

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate("reviewerId", "fullname username" )
      .sort({ createdAt: -1 }); 
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to get reviews", error: err.message });
  }
};

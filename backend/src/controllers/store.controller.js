const { Store, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Get store profile for the logged-in seller
 * @route GET /api/stores/profile
 * @access Private (Seller only)
 */
exports.getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure the user is a seller (though middleware should handle this)
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only sellers can view store profiles.",
      });
    }

    const store = await Store.findOne({ sellerId: userId });

    if (!store) {
      // It's okay if a seller hasn't created a store yet
      return res.status(200).json({
        success: true,
        store: null, // Indicate no store exists yet
        message: "No store found for this seller.",
      });
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    logger.error("Get store profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving store profile",
      error: error.message,
    });
  }
};

/**
 * Update store profile for the logged-in seller
 * @route PUT /api/stores/profile
 * @access Private (Seller only)
 */
exports.updateStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeName, description, bannerImageURL } = req.body;

    // Ensure the user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only sellers can update store profiles.",
      });
    }

    // Find the store associated with the seller
    let store = await Store.findOne({ sellerId: userId });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found. Please create a store first.",
      });
    } else {
      // Update existing store fields if provided
      if (storeName) store.storeName = storeName;
      // Allow setting empty description/banner
      if (description !== undefined) store.description = description;
      if (bannerImageURL !== undefined) store.bannerImageURL = bannerImageURL;

      await store.save();
    }

    res.status(200).json({
      success: true,
      message: "Store profile updated successfully",
      store,
    });
  } catch (error) {
    logger.error("Update store profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating store profile",
      error: error.message,
    });
  }
};

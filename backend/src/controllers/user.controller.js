const { User, Address, Payment } = require("../models");
const logger = require("../utils/logger");

/**
 * Get user profile information including addresses and payment methods
 * @route GET /api/users/profile
 * @access Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user without password field
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find user's addresses
    const addresses = await Address.find({ userId });

    // Find user's payment methods
    const payments = await Payment.find({ userId }).select("-orderId"); // Exclude orderId if not needed

    // Combine data into a single response object
    const userProfile = {
      id: user._id,
      username: user.username,
      fullname: user.fullname, // Include fullname
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL,
      addresses: addresses || [], // Embed addresses
      paymentMethods: payments || [], // Embed payment methods
    };

    res.status(200).json({
      success: true,
      user: userProfile, // Return the combined profile
    });
  } catch (error) {
    logger.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user profile",
      error: error.message,
    });
  }
};

/**
 * Update user profile (User details only)
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Only handle user-specific fields here
    const { username, email, avatarURL, fullname } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatarURL) user.avatarURL = avatarURL;
    if (fullname) user.fullname = fullname; // Update fullname

    await user.save();

    // Return only the updated user fields (excluding address/payment)
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    logger.error("Update user profile error:", error);
    // Add specific error handling for duplicate keys if needed
    if (error.code === 11000) {
      // Handle duplicate key error (e.g., username or email)
      return res.status(400).json({
        success: false,
        message: "Username or email already exists.",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

/**
 * Get user addresses
 * @route GET /api/users/addresses
 * @access Private
 */
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.find({ userId });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    logger.error("Get user addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user addresses",
      error: error.message,
    });
  }
};

/**
 * Add new address
 * @route POST /api/users/addresses
 * @access Private
 */
exports.addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, street, city, state, country, isDefault } =
      req.body;

    // Validate required fields
    if (!fullName || !phone || !street || !city || !state || !country) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Create new address
    const address = await Address.create({
      userId,
      fullName,
      phone,
      street,
      city,
      state,
      country,
      isDefault: isDefault || false, // Ensure isDefault is boolean
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    logger.error("Add user address error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding user address",
      error: error.message,
    });
  }
};

/**
 * Update address
 * @route PUT /api/users/addresses/:addressId
 * @access Private
 */
exports.updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const { fullName, phone, street, city, state, country, isDefault } =
      req.body;

    // Find address belonging to the user
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    // Update address fields if provided
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;

    // Handle default address logic
    // Check if isDefault is explicitly provided in the request body
    if (isDefault !== undefined) {
      if (isDefault === true && !address.isDefault) {
        // If setting this address as default, unset others
        await Address.updateMany(
          { userId, isDefault: true, _id: { $ne: addressId } }, // Exclude current address
          { $set: { isDefault: false } }
        );
        address.isDefault = true;
      } else if (isDefault === false && address.isDefault) {
        address.isDefault = false;
      }
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    logger.error("Update user address error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user address",
      error: error.message,
    });
  }
};

/**
 * Delete address
 * @route DELETE /api/users/addresses/:addressId
 * @access Private
 */
exports.deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    // Optional: Prevent deleting the default address? Or handle setting a new default?
    if (address.isDefault) {
      // Find another address to set as default
      const otherAddress = await Address.findOne({
        userId,
        _id: { $ne: addressId },
      });
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      } else {
      }
    }

    await address.deleteOne(); // Use deleteOne() or remove()

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    logger.error("Delete user address error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user address",
      error: error.message,
    });
  }
};

/**
 * Get payment methods
 * @route GET /api/users/payment-methods
 * @access Private
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await Payment.find({ userId }).select("-orderId");

    res.status(200).json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    logger.error("Get payment methods error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving payment methods",
      error: error.message,
    });
  }
};

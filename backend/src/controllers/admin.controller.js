const { User, Category, Product, Order, Store } = require("../models");
const logger = require("../utils/logger");

// Export all controller functions
module.exports = {
  // User Management
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      logger.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving users",
        error: error.message,
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, email, password, role, fullname, action } = req.body;

      const userExists = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email or username",
        });
      }

      const user = await User.create({
        username,
        email,
        password,
        role,
        fullname,
        action,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullname: user.fullname,
          action: user.action,
        },
      });
    } catch (error) {
      logger.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving user",
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username, email, role, fullname, action } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { username, email, role, fullname, action },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      logger.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating user",
        error: error.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      logger.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message,
      });
    }
  },

  toggleUserStatus: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.action = user.action === "unlock" ? "lock" : "unlock";
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${
          user.action === "lock" ? "locked" : "unlocked"
        } successfully`,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          action: user.action,
        },
      });
    } catch (error) {
      logger.error("Toggle user status error:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling user status",
        error: error.message,
      });
    }
  },

  // Category Management
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      logger.error("Get all categories error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving categories",
        error: error.message,
      });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      const category = await Category.create({ name, description });
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      logger.error("Create category error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating category",
        error: error.message,
      });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      logger.error("Get category by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving category",
        error: error.message,
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      logger.error("Update category error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating category",
        error: error.message,
      });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      logger.error("Delete category error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting category",
        error: error.message,
      });
    }
  },

  // Product Management
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find()
        .populate("categoryId")
        .populate("sellerId");
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      logger.error("Get all products error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving products",
        error: error.message,
      });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description } = req.body;
      const product = await Product.create({ name, description });
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      logger.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message,
      });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      logger.error("Get product by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving product",
        error: error.message,
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { name, description } = req.body;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      logger.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      logger.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting product",
        error: error.message,
      });
    }
  },

  // Order Management
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('buyerId')
        .populate('addressId');
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      logger.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving orders",
        error: error.message,
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("userId")
        .populate("products.productId");
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      logger.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving order",
        error: error.message,
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate("userId")
        .populate("products.productId");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      logger.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating order status",
        error: error.message,
      });
    }
  },
  // Store Management
  getAllStores: async (req, res) => {
    try {
      const stores = await Store.find().populate('sellerId');
      res.status(200).json({
        success: true,
        stores,
      });
    } catch (error) {
      logger.error("Get all stores error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving stores",
        error: error.message,
      });
    }
  },

  approveStore: async (req, res) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      ).populate('sellerId');

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Store approved successfully",
        store,
      });
    } catch (error) {
      logger.error("Approve store error:", error);
      res.status(500).json({
        success: false,
        message: "Error approving store",
        error: error.message,
      });
    }
  },

  rejectStore: async (req, res) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      ).populate('sellerId');

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Store rejected successfully",
        store,
      });
    } catch (error) {
      logger.error("Reject store error:", error);
      res.status(500).json({
        success: false,
        message: "Error rejecting store",
        error: error.message,
      });
    }
  },
};

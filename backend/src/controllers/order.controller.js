const {
  Order,
  OrderItem,
  User,
  ShoppingCart,
  Inventory,
} = require("../models");
const logger = require("../utils/logger");

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { addressId, cartItems, productId, totalAmount } = req.body;

    const buyerId = req.user.id;

    // Validate required fields
    if (!addressId || !cartItems || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: addressId, cartItems, totalAmount",
      });
    }

    // Create the order
    const order = await Order.create({
      buyerId,
      addressId,
      totalPrice: totalAmount,
      status: "pending",
    });
    console.log("adsfasdfds", cartItems);

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        // Handle the case where productId is an array of objects with idProduct field
        let actualProductId;

        if (productId && Array.isArray(productId) && productId.length > 0) {
          // Find the matching product ID in the array
          const productMatch = productId.find((p) => p.idProduct);
          actualProductId = productMatch ? productMatch.idProduct : item._id;
        } else {
          actualProductId = item._id;
        }

        // Create the order item
        const orderItem = await OrderItem.create({
          orderId: order._id,
          productId: actualProductId,
          quantity: item.quantity,
          unitPrice: item.price,
          status: "pending",
        });

        // Update inventory (decrease quantity)
        await Inventory.findOneAndUpdate(
          { productId: actualProductId },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );

        return orderItem;
      })
    );

    // Delete the shopping cart after successful order creation
    await ShoppingCart.deleteOne({ userId: buyerId });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        buyerId: order.buyerId,
        addressId: order.addressId,
        orderDate: order.orderDate,
        totalPrice: order.totalPrice,
        status: order.status,
        items: orderItems,
      },
    });
  } catch (error) {
    logger.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

/**
 * Get all orders for current user
 * @route GET /api/orders
 * @access Private
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all orders for the user
    const orders = await Order.find({ buyerId: userId })
      .populate("addressId")
      .sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: "No orders found",
      });
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id }).populate({
          path: "productId",
          select: "title image price description",
        });

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    logger.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};

/**
 * Get single order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Find the order
    const order = await Order.findById(orderId).populate("addressId");

    // Check if order exists and belongs to this user
    if (!order || order.buyerId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const items = await OrderItem.find({ orderId: order._id }).populate({
      path: "productId",
      select: "title image price description",
    });

    const orderWithItems = {
      ...order.toObject(),
      items,
    };

    res.status(200).json({
      success: true,
      order: orderWithItems,
    });
  } catch (error) {
    logger.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

/**
 * Cancel an order
 * @route PATCH /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Find the order
    const order = await Order.findById(orderId);

    // Check if order exists and belongs to this user
    if (!order || order.buyerId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be canceled (only pending orders)
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be canceled in '${order.status}' status.`,
      });
    }

    // Update order status
    order.status = "canceled";
    await order.save();

    // Update all order items status
    await OrderItem.updateMany({ orderId: order._id }, { status: "canceled" });

    // Return inventory quantities
    const orderItems = await OrderItem.find({ orderId: order._id });

    await Promise.all(
      orderItems.map(async (item) => {
        // Add back to inventory
        await Inventory.findOneAndUpdate(
          { productId: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
      })
    );

    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      order: {
        id: order._id,
        status: order.status,
      },
    });
  } catch (error) {
    logger.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error canceling order",
      error: error.message,
    });
  }
};

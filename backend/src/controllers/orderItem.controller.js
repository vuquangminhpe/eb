const OrderItem = require("../models/OrderItem");

const createOrderItem = async (req, res) => {
    try {
        const { orderId, productId, quantity } = req.body;
        const newOrderItem = new OrderItem({ orderId, productId, quantity });
        const savedOrderItem = await newOrderItem.save();
        res.status(201).json(savedOrderItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllOrderItems = async (req, res) => {
    try {
        const orderItems = await OrderItem.find();
        res.status(200).json(orderItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderItemBySellerId = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const orderItems = await OrderItem.find().populate("productId");

        const filteredItems = orderItems.filter(orderItem => {
            return orderItem.productId && orderItem.productId.sellerId == sellerId;
        });

        res.status(200).json(filteredItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderItemForStatistic = async (req, res) => {
    try {
        const sellerId = req.params.sellerId; 
        const orderItems = await OrderItem.find({status: "shipped"})
            .populate([
                {
                    path: "orderId",
                    populate: [
                        { path: "buyerId" },
                        { path: "addressId" }
                    ]
                },
                {
                    path: "productId",
                    populate: [
                        { path: "sellerId" },
                        { path: "categoryId" }
                    ]
                }
            ]);

        const result = orderItems.filter((orderItem) => 
            orderItem.productId && orderItem.productId.sellerId &&
            orderItem.productId.sellerId._id.toString() === sellerId
        );
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderItem = async (req, res) => {
    try {
        const updatedOrderItem = await OrderItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteOrderItem = async (req, res) => {
    try {
        const deletedOrderItem = await OrderItem.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedOrderItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrderItem, getAllOrderItems, getOrderItemForStatistic, getOrderItemBySellerId, updateOrderItem, deleteOrderItem };
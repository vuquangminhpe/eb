const ShippingInfo = require("../models/ShippingInfo");

const createShippingInfo = async (req, res) => {
    try {
        const shippingInfo = await ShippingInfo.create(req.body);
        res.status(201).json(shippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllShippingInfos = async (req, res) => {
    try {
        const shippingInfos = await ShippingInfo.find();
        res.status(200).json(shippingInfos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getShippingInfoBySellerId = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const shippingInfos = await ShippingInfo.find()
            .populate({
                path: "orderItemId",
                populate: {
                    path: "productId",
                },
            });
        const result = shippingInfos.filter((shippingInfo) => shippingInfo.orderItemId.productId.sellerId == sellerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDetailedShippingInfo = async (req, res) => {
    try {
        const shippingInfo = await ShippingInfo.findById(req.params.id)
            .populate({
                path: "orderItemId",
                populate: [
                    {
                        path: "orderId",
                        populate: [
                            { path: "buyerId" },
                            { path: "addressId" }
                        ]
                    },
                    { path: "productId",
                        populate: [
                            { path: "sellerId" },
                            { path: "categoryId" }
                        ]
                     }
                ],
            });
        res.status(200).json(shippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateShippingInfo = async (req, res) => {
    try {
        const { carrier, trackingNumber, estimatedArrival, status } = req.body;
        const updatedShippingInfo = await ShippingInfo.findByIdAndUpdate(req.params.id, { carrier, trackingNumber, estimatedArrival, status }, { new: true });
        res.status(200).json(updatedShippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateShippingInfoByOrderItemId = async (req, res) => {
    try {
        const updatedShippingInfo = await ShippingInfo.findOneAndUpdate({ orderItemId: req.params.id }, req.body, { new: true });
        res.status(200).json(updatedShippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteShippingInfo = async (req, res) => {
    try {
        const deletedShippingInfo = await ShippingInfo.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedShippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createShippingInfo, getAllShippingInfos, getShippingInfoBySellerId, getDetailedShippingInfo, updateShippingInfo, updateShippingInfoByOrderItemId, deleteShippingInfo };
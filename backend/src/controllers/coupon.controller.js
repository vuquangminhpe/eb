const Coupon = require("../models/Coupon");

const createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, maxUsage, productId } =
            req.body;

        const newCoupon = new Coupon({
            code,
            discountPercent,
            startDate,
            endDate,
            maxUsage,
            productId,
        });

        const savedCoupon = await newCoupon.save();

        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().populate("productId");
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCouponBySellerID = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const coupons = await Coupon.find().populate("productId");
        const result = coupons.filter((coupon) => coupon.productId.sellerId == sellerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, maxUsage, productId } =
            req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                code,
                discountPercent,
                startDate,
                endDate,
                maxUsage,
                productId,
            },
            { new: true }
        );
        res.status(200).json(
            updatedCoupon
        )
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedCoupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCoupon,
    getCouponBySellerID,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
};
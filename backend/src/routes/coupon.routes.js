const express = require("express");
const router = express.Router();
const CouponController = require("../controllers/coupon.controller");

router.post("/create", CouponController.createCoupon);
router.get("/seller/:sellerId", CouponController.getCouponBySellerID);
router.get("/all", CouponController.getAllCoupons);
router.put("/update/:id", CouponController.updateCoupon);
router.delete("/delete/:id", CouponController.deleteCoupon);

module.exports = router;
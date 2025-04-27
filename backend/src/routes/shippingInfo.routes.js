const express = require("express");
const router = express.Router();
const ShippingInfoController = require("../controllers/shippingInfo.controller");

router.post("/create", ShippingInfoController.createShippingInfo);
router.get("/all", ShippingInfoController.getAllShippingInfos);
router.get("/seller/:sellerId", ShippingInfoController.getShippingInfoBySellerId);
router.get("/detailed/:id", ShippingInfoController.getDetailedShippingInfo);
router.put("/update/:id", ShippingInfoController.updateShippingInfo);
router.put("/updateByOrderItemId/:id", ShippingInfoController.updateShippingInfoByOrderItemId);
router.delete("/delete/:id", ShippingInfoController.deleteShippingInfo);

module.exports = router;
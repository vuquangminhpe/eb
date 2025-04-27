const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
router.post("/", inventoryController.createInventory);
router.put("/:productId", inventoryController.updateInventory);
router.get("/:productId", inventoryController.getInventoryByProduct);
router.get("/", inventoryController.getAllInventories);

module.exports = router;

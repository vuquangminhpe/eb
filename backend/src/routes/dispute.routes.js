const express = require("express");
const router = express.Router();
const controller = require("../controllers/dispute.controller");

router.post("/", controller.createDispute);
router.get("/", controller.getAllDisputes);
router.put("/:id", controller.updateDisputeStatus);

module.exports = router;

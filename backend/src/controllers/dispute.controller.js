const Dispute = require("../models/Dispute");

// Tạo khiếu nại
exports.createDispute = async (req, res) => {
  try {
    const dispute = new Dispute(req.body);
    await dispute.save();
    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách khiếu nại
exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("orderId")
      .populate("raisedBy");
    res.status(200).json(disputes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái hoặc phản hồi
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const updated = await Dispute.findByIdAndUpdate(
      id,
      { status, resolution },
      { new: true }
    )
    .populate("orderId")
    .populate("raisedBy");
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

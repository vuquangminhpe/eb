const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shoppingCartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    productId: [
      {
        idProduct: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: String, default: "1" },
      },
    ],
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);

const mongoose = require("../DB/database");
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalvalue: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
const cart = mongoose.model("cart", cartSchema);
module.exports = cart;

const mongoose = require("../DB/database");
const order = new mongoose.Schema(
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
          min: 1,
          required: true,
        },
      },
    ],
    totalValue: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
    transactionId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirm", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  {
    timestamps: true,
  }
);
const ordermodel = mongoose.model("orders", order);
module.exports = ordermodel;

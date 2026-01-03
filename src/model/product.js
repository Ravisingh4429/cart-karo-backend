const mongoose = require("../DB/database");
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String] },
    stock: { type: Number, required: true },
    descriptions: { type: String, default: "No more details available" },
    reviews: {
      rate: { type: Number, min: 0, max: 5, default: 0 },
      counts: { type: Number, default: 0 },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const productModel = mongoose.model("products", productSchema);
module.exports = productModel;

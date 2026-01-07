const mongoose = require("../DB/database");
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);
const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;

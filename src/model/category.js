const mongoose = require("../DB/database");
const categorySchema = new mongoose.Schema(
  {
    adminid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);
const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;

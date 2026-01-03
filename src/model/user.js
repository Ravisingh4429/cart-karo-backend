const mongoose = require("../DB/database");
const userschma = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    daddress: { type: String, required: true },
    profilePic: { type: String },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("User", userschma);
module.exports = userModel;

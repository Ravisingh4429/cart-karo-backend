const mongoose = require("mongoose");
require("dotenv").config({ path: "../../.env" });

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("db connected");
  })
  .catch((e) => {
    console.log("error in db connect", e);
  });
module.exports = mongoose;

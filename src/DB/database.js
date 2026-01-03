const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("db connected");
  })
  .catch((e) => {
    console.log("error in db connect", e);
  });
module.exports = mongoose;

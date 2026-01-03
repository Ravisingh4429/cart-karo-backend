const joi = require("joi");
const userValid = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().lowercase().required(),
  password: joi.string().lowercase().min(8).required(),
  daddress: joi.string().lowercase().min(15).required(),
});
module.exports = userValid;

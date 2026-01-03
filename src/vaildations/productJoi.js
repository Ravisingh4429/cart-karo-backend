const joi = require("joi");
const productJoi = joi.object({
  title: joi.string().required().lowercase(),
  price: joi.number().min(0).required(),
  stock: joi.number().required().min(0),
  descriptions: joi.string().default("No more details available"),
  category: joi.string().required(),
});
module.exports = productJoi;

const joi = require("joi");
const cartJoi = joi.object({
  product: joi.string().required().messages({
    "string.empty": "Product id is required",
  }),
  quantity: joi.number().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
  }),
});
module.exports = cartJoi;

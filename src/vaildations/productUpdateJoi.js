const joi = require("joi");
const productUpdateJoi = joi
  .object({
    title: joi.string().lowercase(),
    price: joi.number().min(0),
    stock: joi.number().min(0),
    descriptions: joi.string().default("No more details available"),
    category: joi.string(),
  })
  .min(1);
module.exports = productUpdateJoi;

const routes = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/rolecheck");
const cart = require("../model/cart");
const product = require("../model/product");
const cartJoi = require("../vaildations/cartJoi");
// fetch cart
routes.get("/", auth, async (req, res) => {
  const cartFetch = await cart
    .find({
      user: req.user._id,
    })
    .populate("products.product", "title _id stock price");
  if (cartFetch.length === 0) {
    return res.status(200).json({ message: "Empty Cart" });
  }
  res.status(200).json(cartFetch);
});

//insert cart
routes.post("/", auth, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No Products added to cart" });
  }
  const { error, value } = cartJoi.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const productfind = await product.findOne({ _id: value.product });
  if (!productfind) {
    return res.status(404).json({ message: "No Product found" });
  }

  const totalvalue = productfind.price * value.quantity;
  const checkCart = await cart.findOne({ user: req.user._id });

  if (!checkCart) {
    if (value.quantity > productfind.stock) {
      return res
        .status(400)
        .json({ message: `only ${productfind.stock} available in stock` });
    }
    const newCart = new cart({
      user: req.user._id,
      products: [
        {
          product: value.product,
          quantity: value.quantity,
        },
      ],
      totalvalue,
    });
    await newCart.save();
    return res.status(201).json({ message: "Product added to cart", newCart });
  }

  let productIndex = checkCart.products.findIndex(
    (item) => item.product.toString() === value.product
  );
  if (productIndex > -1) {
    const existQuantity = checkCart.products[productIndex].quantity;
    const newQuantity = value.quantity;
    const totalQuantity = existQuantity + newQuantity;
    if (totalQuantity > productfind.stock) {
      return res.status(400).json({
        message: `only ${productfind.stock - existQuantity} available in stock`,
      });
    }
    checkCart.products[productIndex].quantity = totalQuantity;
  } else {
    if (value.quantity > productfind.stock) {
      return res.status(400).json({
        message: `Only ${productfind.stock} items available in stock`,
      });
    }
    checkCart.products.push({
      product: value.product,
      quantity: value.quantity,
    });
  }
  let total = 0;

  for (let element of checkCart.products) {
    const prod = await product.findById(element.product);
    total += element.quantity * prod.price;
  }

  checkCart.totalvalue = total;
  await checkCart.save();

  res.status(200).json({ checkCart });
});

// decrease one item
// increase one item
module.exports = routes;

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
routes.patch("/decrease/:id", auth, async (req, res) => {
  try {
    const productId = req.params.id;

    // cart find
    const checkCart = await cart.findOne({ user: req.user._id });
    if (!checkCart) {
      return res.status(404).json({ message: "Empty Cart" });
    }
    // product find in cart
    const productIndex = checkCart.products.findIndex((item) =>
      item.product.equals(productId)
    );

    // decrease
    if (productIndex === -1) {
      return res.status(400).json({ message: "Product not found" });
    }

    const existQuantity = checkCart.products[productIndex].quantity;
    if (existQuantity > 1) {
      checkCart.products[productIndex].quantity = existQuantity - 1;
    } else {
      checkCart.products.splice(productIndex, 1);
      if (checkCart.products.length === 0) {
        await cart.findByIdAndDelete({ _id: checkCart._id });
        return res.status(404).json({ message: "Cart is Empty" });
      }
    }
    // update cart price
    let total = 0;
    for (let element of checkCart.products) {
      const prod = await product.findById(element.product);
      total += element.quantity * prod.price;
    }
    checkCart.totalvalue = total;
    // save
    await checkCart.save();
    res.status(200).json({ checkCart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// increase one item
routes.patch("/increse/:id", auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const productfind = await product.findOne({ _id: productId });
    if (!productfind) {
      return res.status(404).json({ message: "No Product found" });
    }
    // cart find
    const checkCart = await cart.findOne({ user: req.user._id });
    if (!checkCart) {
      return res.status(404).json({ message: "Empty Cart" });
    }
    // product find in cart
    const productIndex = checkCart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    // increase
    if (productIndex === -1) {
      return res.status(400).json({ message: "Product not found" });
    }
    const existQuantity = checkCart.products[productIndex].quantity;
    const totalQuantity = existQuantity + 1;
    if (totalQuantity > productfind.stock) {
      return res.status(400).json({
        message: `only ${productfind.stock - existQuantity} available in stock`,
      });
    }
    checkCart.products[productIndex].quantity = totalQuantity;
    // update cart price
    let total = 0;
    for (let element of checkCart.products) {
      const prod = await product.findById(element.product);
      total += element.quantity * prod.price;
    }
    checkCart.totalvalue = total;
    // save
    await checkCart.save();
    res.status(200).json({ checkCart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = routes;

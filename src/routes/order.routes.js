const { v4: uuidv4 } = require("uuid");
const routes = require("express").Router();
const order = require("../model/order");
const cart = require("../model/cart");
const product = require("../model/product");
const auth = require("../middleware/auth");
const rolecheck = require("../middleware/rolecheck");
routes.get("/all", auth, async (req, res) => {
  try {
    let { page = 1, limit = 5 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const allOrders = await order
      .find({ user: req.user._id })
      .populate("products.product", "title price image")
      .select("paymentStatus orderStatus createdAt")
      .skip((page - 1) * limit)
      .limit(limit);
    if (!allOrders) {
      return res
        .status(404)
        .json({ message: "Please Placed Your First Order" });
    }
    res.status(200).json({ message: "All Orders", allOrders });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// create
routes.post("/create", auth, async (req, res) => {
  try {
    const findCart = await cart
      .findOne({ user: req.user._id })
      .populate("products.product");
    if (!findCart || findCart.products.length === 0) {
      return res.status(404).json({ message: "Please Add Product in Cart" });
    }
    if (!["Cash", "Online"].includes(req.body.paymentMode)) {
      return res.status(400).json({ message: "Invalid Payment Mode" });
    }

    for (let item of findCart.products) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Only ${item.product.stock} left for ${item.product.title}`,
        });
      }
    }
    let transactionId = null;
    let paymentStatus = "Pending";
    if (req.body.paymentMode === "Online") {
      transactionId = uuidv4();
      paymentStatus = "Paid";
    }
    const newOrder = new order({
      user: req.user._id,
      products: findCart.products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalValue: findCart.totalvalue,
      paymentMode: req.body.paymentMode,
      transactionId,
      paymentStatus,
    });
    await newOrder.save();
    for (let item of findCart.products) {
      await product.findByIdAndUpdate(
        { _id: item.product._id },
        { $inc: { stock: -item.quantity } }
      );
    }
    await cart.findByIdAndDelete({ _id: findCart._id });
    res.status(201).json({ message: "Order Placed Successfully", newOrder });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// single order
routes.get("/:id", auth, async (req, res) => {
  try {
    const orderID = req.params.id;
    const findOrder = await order
      .findById({ _id: orderID, user: req.user._id })
      .populate("products.product");
    if (!findOrder) {
      return res
        .status(404)
        .json({ message: "Invalid Order Id no order found" });
    }
    res.status(200).json({ findOrder });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// order status update by admin
routes.patch("/status/:orderID", auth, rolecheck, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (
      !["placed", "confirm", "shipped", "delivered", "cancelled"].includes(
        orderStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Order Status Only be placed, confirm,shipped,delivered,cancelled",
      });
    }
    const orderID = req.params.orderID;
    const findOrder = await order.findById({
      _id: orderID,
    });
    if (!findOrder) {
      return res
        .status(404)
        .json({ message: "Invalid Order Id no order found" });
    }
    findOrder.orderStatus = orderStatus;
    await findOrder.save();
    return res.status(200).json({ message: "Order Status Updated", findOrder });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = routes;

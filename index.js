require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const cors = require("cors");
const mongoose = require("./src/DB/database");
const user = require("./src/routes/user");
const categoryRoutes = require("./src/routes/category.routes");
const productsRoutes = require("./src/routes/products.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");
mongoose;

//middleware
app.use(express.json());
app.use(cors());
app.use(
  "/products",
  express.static(path.join(__dirname, "src/upload/products"))
);

// all routes
app.use("/api/user", user);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

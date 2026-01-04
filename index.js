require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("./src/DB/database");
const user = require("./src/routes/user");
const categoryRoutes = require("./src/routes/category.routes");
const productsRoutes = require("./src/routes/products.routes");
const cartRoutes = require("./src/routes/cart.routes");
mongoose;

//middleware
app.use(express.json());

// all routes
app.use("/api/user", user);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

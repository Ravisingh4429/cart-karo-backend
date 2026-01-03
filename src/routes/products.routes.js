const proutes = require("express").Router();
const products = require("../model/product");
const category = require("../model/category");
const auth = require("../middleware/auth");
const role = require("../middleware/rolecheck");
const productJoi = require("../vaildations/productJoi");
const productUpdateJoi = require("../vaildations/productUpdateJoi");
// create
proutes.post("/create", auth, role, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Please pass data" });
  }
  // valid the input
  const productJoiValidate = productJoi.validate(req.body);
  if (productJoiValidate.error) {
    return res.status(400).json(productJoiValidate.error.message);
  }
  // checking category
  const checkCategory = await category.findById({
    _id: productJoiValidate.value.category,
  });
  if (!checkCategory) {
    return res
      .status(404)
      .json({ message: "This category is not present in databases" });
  }
  // checking product in db
  const checkProduct = await products.findOne({
    title: productJoiValidate.value.title,
    category: productJoiValidate.value.category,
  });
  if (checkProduct) {
    return res
      .status(400)
      .json({ message: "This product already there in this category" });
  }
  // adding in db
  const newProduct = new products({
    title: productJoiValidate.value.title,
    price: productJoiValidate.value.price,
    stock: productJoiValidate.value.stock,
    descriptions: productJoiValidate.value.descriptions,
    category: productJoiValidate.value.category,
  });
  await newProduct.save();

  res
    .status(201)
    .json({ message: "New Product Added successfully", newProduct });
});

//display
proutes.get("/display", async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const fetchAllProducts = await products
    .find()
    .populate("category", "name")
    .skip((page - 1) * limit)
    .limit(limit);
  if (!fetchAllProducts) {
    return res.status(404).json({ message: "No Products found in database" });
  }
  res.status(200).json(fetchAllProducts);
});

//display single product
proutes.get("/:id/product", async (req, res) => {
  const pid = req.params.id;
  const findSingleProduct = await products
    .findById({ _id: pid })
    .populate("category", "name");
  if (!findSingleProduct) {
    return res.status(400).json({ message: "Invalid Product id" });
  }
  res.status(200).json({ findSingleProduct });
});

// delete
proutes.delete("/:id", auth, role, async (req, res) => {
  try {
    const pid = req.params.id;
    const findSingleProductDelete = await products.findByIdAndDelete({
      _id: pid,
    });
    if (!findSingleProductDelete) {
      return res.status(400).json({ message: "No Product found" });
    }
    res.status(200).json({
      message: "product delete successfully",
      findSingleProductDelete,
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

//update
proutes.put("/:id", auth, role, async (req, res) => {
  const id = req.params.id;
  if (!req.body) {
    return res.status(400).json({ message: "Please pass data" });
  }
  let checkProduct = await products.findById({ _id: id });

  if (!checkProduct) {
    return res.status(400).json({ message: "No Product found in db" });
  }
  const productUpdateJoiValidate = productUpdateJoi.validate(req.body);
  if (productUpdateJoiValidate.error) {
    return res.status(400).json(productUpdateJoiValidate.error.message);
  }
  const checkCategory = await category.findById({
    _id: productUpdateJoiValidate.value.category,
  });
  if (!checkCategory) {
    return res
      .status(404)
      .json({ message: "This category is not present in databases" });
  }
  const updateProduct = await products.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        ...productUpdateJoiValidate.value,
        category: checkCategory._id,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ message: "Product is updated successfully", updateProduct });
});

//feature product
//searchproduct
module.exports = proutes;

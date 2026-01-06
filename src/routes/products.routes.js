const proutes = require("express").Router();
const products = require("../model/product");
const category = require("../model/category");
const multer = require("multer");
const auth = require("../middleware/auth");
const role = require("../middleware/rolecheck");
const productJoi = require("../vaildations/productJoi");
const productUpdateJoi = require("../vaildations/productUpdateJoi");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/products");
  },
  filename: (req, file, cb) => {
    const timestamps = Date.now();
    const origanilname = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `${timestamps}-${origanilname}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, png, gif images are allowed"));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
// create
proutes.post(
  "/create",
  auth,
  role,
  upload.array("products", 5),
  async (req, res) => {
    const productimage = req.files.map((image) => image.filename);
    if (productimage.length === 0) {
      return res.status(400).json({ message: "Atlist one image is required" });
    }
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
      images: productimage,
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "New Product Added successfully", newProduct });
  }
);

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
proutes.get("/featured", async (req, res) => {
  try {
    const featureProducts = await products
      .find()
      .sort({ createdAt: -1 })
      .select("title price reviews")
      .limit(3);
    if (featureProducts.length === 0) {
      return res.status(404).json({ message: "no products found in db" });
    }
    res.status(200).json({ featureProducts });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
});
//searchproduct
proutes.get("/search", async (req, res) => {
  try {
    const query = req.query.search;
    if (!query) {
      return res.status(400).json({ message: "Enter any value to search" });
    }
    const searchValue = await products
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { descriptions: { $regex: query, $options: "i" } },
        ],
      })
      .select("title price reviews")
      .sort({ price: 1 })
      .limit(10);
    if (searchValue.length === 0) {
      return res.status(404).json({ message: "No data Found" });
    }
    res.status(200).json({ searchValue });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
});
module.exports = proutes;

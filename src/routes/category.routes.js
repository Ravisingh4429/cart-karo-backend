const catRoutes = require("express").Router();
const category = require("../model/category");
const rolecheck = require("../middleware/rolecheck");
const auth = require("../middleware/auth");
// create
catRoutes.post("/create", auth, rolecheck, async (req, res) => {
  try {
    let { name } = req.body;
    name = name.toLowerCase();
    const findCat = await category.findOne({ name: name.toLowerCase() });
    if (findCat) {
      return res
        .status(400)
        .json({ message: `${name} category is already created` });
    }
    const newCategory = new category({
      name,
      adminid: req.user._id,
    });
    await newCategory.save();
    res.status(201).json({ message: "New Category created", newCategory });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// display

catRoutes.get("/display", async (req, res) => {
  const allCategory = await category.find().select("-adminid");
  if (!allCategory) {
    return res.status(404).json({ message: "no Category found" });
  }
  res.status(200).json(allCategory);
});

module.exports = catRoutes;

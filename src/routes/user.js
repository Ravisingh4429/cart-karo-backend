const routes = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userJoi = require("../vaildations/userJoi");
const user = require("../model/user");
const auth = require("../middleware/auth");

// signup
routes.post("/signup", async (req, res) => {
  try {
    const { name, email, password, daddress } = req.body;
    const userInputValid = userJoi.validate(req.body);
    const checkUserAlready = await user.findOne({
      email,
    });

    if (checkUserAlready) {
      return res.status(400).json({ message: "user already there" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const userNew = new user({
      name,
      email,
      password: hashPassword,
      daddress,
    });
    await userNew.save();
    res.status(201).json({ message: "user register" });
  } catch (error) {
    res.json("internal server error");
  }
});

// login

routes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const checkUser = await user.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({ message: "no user found with this email" });
    }
    const decpass = await bcrypt.compare(password, checkUser.password);
    if (!decpass) {
      return res.status(400).json({ message: "password is incorrect" });
    }
    const data = {
      _id: checkUser._id,
      name: checkUser.name,
      email: checkUser.email,
      daddress: checkUser.daddress,
      isAdmin: checkUser.isAdmin,
    };
    const token = jwtGenerate(data);
    res.json(token);
  } catch (error) {
    res.json({ message: "internal server error" });
  }
});

// particluar user
routes.get("/me", auth, async (req, res) => {
  try {
    const userid = req.user._id;
    const finduser = await user.findById({ _id: userid }).select("-password");
    res.json(finduser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});
const jwtGenerate = (data) => {
  return jwt.sign(data, process.env.JWT, { expiresIn: "30d" });
};
module.exports = routes;

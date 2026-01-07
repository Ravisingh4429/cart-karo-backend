const routes = require("express").Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const userJoi = require("../vaildations/userJoi");
const user = require("../model/user");
const auth = require("../middleware/auth");

// signup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/profiles/");
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
    cb(new Error("Invalid file type only jpeg,png,gif allowed", false));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
routes.post("/signup", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const image = req.file.filename;
    const { error, value } = userJoi.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
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
      address,
      profilePic: image,
    });
    await userNew.save();
    res.status(201).json({ message: "user register" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// login

routes.post("/login", async (req, res) => {
  // try {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
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
  // } catch (error) {
  //   res.json({ message: "internal server error" });
  // }
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

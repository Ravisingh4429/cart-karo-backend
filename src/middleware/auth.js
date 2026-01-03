const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) {
    return res.status(401).json({ messsage: "Authorization token required" });
  }
  const token = header.split(" ")[1];

  try {
    if (!token || token.startsWith("Bearer ")) {
      return res.status(400).json({ messsage: "Invalid token" });
    }
    const user = jwt.verify(token, process.env.JWT);
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: "Error in auth Middleware" });
  }
};
module.exports = auth;

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("Token received:", token); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      throw new Error("Authentication failed");
    }
    console.log("Authenticated user:", user); // Debug log
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;

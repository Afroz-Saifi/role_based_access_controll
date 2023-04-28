const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/User.model");
const { blacklist } = require("../blacklist");

const authMiddleware = async (req, res, next) => {
  try {
    const { token, refresh_token } = req.cookies;
    if (blacklist.includes(token)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const { userId } = decodedToken;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the user to the request object
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized", err: error.message });
  }
};

module.exports = { authMiddleware };

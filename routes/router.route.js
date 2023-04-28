const express = require("express");
const { User } = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/authentication");
const { authorization } = require("../middlewares/authorization");
const { isBlocked } = require("../middlewares/isBlocked");

const { blacklist } = require("../blacklist");
require("dotenv").config();

const router = express.Router();

router.post("/register", isBlocked, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const hashed_password = bcrypt.hashSync(password, 8);
    const user = new User({ email, password: hashed_password, name, role });
    await user.save();

    res.json({ message: "User created successfully" });
  } catch (error) {
    res.send("something went wrong");
  }
});

router.post("/login", isBlocked, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshtoken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("token", token);
    res.cookie("refresh_token", refreshtoken);
    res.json({ msg: "login successfull" });
  } catch (error) {
    console.log(error);
  }
});

router.get(
  "/profile",
  authMiddleware,
  authorization(["Super Admin", "Admin", "User"]),
  async (req, res) => {
    return res.json(req.user);
  }
);

router.delete(
  "/delete_user/:id",
  authMiddleware,
  authorization(["Super Admin", "Admin"]),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ msg: "user deleted successfully" });
    } catch (error) {
      return res.status(400).json({ err: error });
    }
  }
);

router.patch(
  "/update_profile/:id",
  authMiddleware,
  authorization(["Super Admin", "Admin"]),
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, req.body);
      return res.status(201).json({ msg: "user has updated successfully" });
    } catch (error) {
      return res.json({ error });
    }
  }
);

router.get(
  "/todo",
  authMiddleware,
  authorization(["Super Admin"]),
  async (req, res) => {
    try {
      const data = await User.find();
      if (data.lenght == 0) {
        return res.status(404).json({ msg: "no users present" });
      }
      return res.status(200).json({ msg: "all users list", data });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
);

router.get("/logout", (req, res) => {
  const { token } = req.cookies;
  blacklist.push(token);
  res.send("logout successfull");
});

// block a user ==> only auhorized for Super Admin
router.get(
  "/block_user",
  authMiddleware,
  authorization(["Super Admin"]),
  async (req, res) => {
    try {
      const { email_to_block } = req.query;
      await User.aggregate([
        { $match: { email: email_to_block } },
        { $project: { email: 1 } },
        { $out: "block_lists" },
      ]);
      return res.json({ msg: `user with ${email_to_block} has been blocked` });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

router.get("/getnewtoken", authMiddleware, (req, res) => {
  //   const refreshtoken = req.headers.authorization?.split(" ")[2];
  const { refresh_token } = req.cookies;
  const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
  if (decoded) {
    const token = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    return res.json({ msg: "new token has been generated" });
  } else {
    res.send("invalid refresh token, plz login again");
  }
});

module.exports = { router };

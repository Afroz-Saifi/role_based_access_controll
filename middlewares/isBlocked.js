const { Block_list } = require("../models/Block_list.model");

const isBlocked = async (req, res, next) => {
  try {
    const { email } = req.body;
    const exists = await Block_list.findOne({ email });
    if (exists) {
      return res.json({ msg: "this email has been blocked by the company" });
    } else {
      next();
    }
  } catch (error) {}
};

module.exports = { isBlocked };

const mongoose = require("mongoose");

const block_scheme = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
});

const Block_list = mongoose.model("block_list", block_scheme);

module.exports = { Block_list };

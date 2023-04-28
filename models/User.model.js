const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user_schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["Super Admin", "Admin", "User"],
      default: "User",
    },
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("user", user_schema);

module.exports = { User };

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: Number, required: true },
  password: {
    type: String,
    required: function () {
      return this.signInMethod === "manual";
    },
  },
  createdAt: { type: Date, default: Date.now },
  signInMethod: { type: String, enum: ["manual", "google"], default: "manual" },
});

// Create Models
const User = mongoose.model("User", userSchema);

module.exports = { User };

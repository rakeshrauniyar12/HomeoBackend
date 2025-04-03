const mongoose = require("mongoose");

const AppCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 1 },
});

const Counter = mongoose.model("AppCounter", AppCounterSchema);

module.exports = Counter;

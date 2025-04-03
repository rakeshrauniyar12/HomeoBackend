const mongoose = require("mongoose");

const OrderCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 1 },
});

const Counter = mongoose.model("OrderCounter", OrderCounterSchema);

module.exports = Counter;

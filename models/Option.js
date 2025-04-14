const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  potency: [String],
  repetition: [String],
  dosage: [String],
  days: [String],
  unit: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Option", optionSchema);

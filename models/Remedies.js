const mongoose = require("mongoose");

const remediesSchema = new mongoose.Schema({
  remediesName: { type: String, required: true },
  quantity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Remedies", remediesSchema);

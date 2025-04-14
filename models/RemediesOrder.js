const mongoose = require("mongoose");

const remedyOrderSchema = new mongoose.Schema({
  pharmacyEmail: { type: String, required: true },
  remedyId: { type: String, required: true },
  remedyName: { type: String, required: true },
  quantity: { type: String, required: true },
  pharmacyStatus: { type: String, default:"Pending" },
  adminStatus: { type: String, default:"Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RemediesOrder", remedyOrderSchema);

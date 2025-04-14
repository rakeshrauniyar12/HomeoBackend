const mongoose = require("mongoose");

const appointmentFeeSchema = new mongoose.Schema({
  consultationType: { type: String, default: "" },
  consultationFee: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AppointmentFee", appointmentFeeSchema);

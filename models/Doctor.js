const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  date:{type:String},
  time: { type: String, required: true }, // Example: "01:00 PM"
  status: {
    type: String,
    enum: ["available", "booked", "unavailable"],
    default: "available",
  },
});

const scheduleSchema = new mongoose.Schema({
  startDate: { type: String, required: true }, // Format: YYYY-MM-DD
  endDate: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlots: [timeSlotSchema], // Generated time slots
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }], // Link to Appointments
  schedule: [scheduleSchema], // Schedule with dynamic slots
  createdAt: { type: Date, default: Date.now },
});

/**
 * Helper function to generate 15-min slots dynamically
 */

module.exports = mongoose.model("Doctor", doctorSchema);

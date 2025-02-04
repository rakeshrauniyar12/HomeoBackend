const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, "Invalid phone number"],
  },
  doctorName: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false, // Default value is false, meaning appointment is active
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

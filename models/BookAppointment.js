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
    match: [/\S+@\S+\.\S+/, "Invalid email format"],
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, "Invalid phone number"],
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        const [hours, minutes] = value.split(":").map(Number);
        return minutes % 30 === 0; // Ensures only 30-min intervals
      },
      message: "Start time must be in 30-minute intervals (e.g., 9:00, 9:30)",
    },
  },
  endTime: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

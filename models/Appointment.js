const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // Patient's first name
  lastName: { type: String, required: true }, // Patient's last name
  email: { type: String, required: true }, // Patient's email
  phoneNumber: { type: String, required: true }, // Patient's phone number
  location: { type: String, required: true }, // Appointment location

  consultationType: {
    type: String,
    enum: ["Chat", "Video", "Call", "Clinic Visit"],
    required: true,
  },

  doctorEmail: { type: String, required: true }, // Identifies the doctor uniquely

  date: { type: String, required: true }, // YYYY-MM-DD format
  startTime: { type: String, required: true }, // HH:MM AM/PM format

  medicines: {
    complain: { type: String, default: "" }, // Medicine name
    remedies: { type: String, default: "" }, // Medicine name
    dosage: { type: String, default: "" }, // Dosage (e.g., 500mg)
    potency: { type: String, default: "" }, // Dosage (e.g., 500mg)
    frequency: { type: String, default: "" }, // e.g., "Twice a Day"
    duration: { type: String, default: "" }, // e.g., "5 Days"
    nightDuration: { type: String, default: "" }, // e.g., "5 Days"
    pharmacyName: { type: String, default: "" }, // e.g., "5 Days"
    instructions: { type: String }, // Additional instructions (optional)
    showMedicine: { type: String, default: "No" }, // Additional instructions (optional)
  },
  appointmentFee: { type: String, default: 100 },
  appointmentPaymentStatus: { type: String, default: "Pending" },
  appointmentStatus: { type: String, default: "Booked" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);

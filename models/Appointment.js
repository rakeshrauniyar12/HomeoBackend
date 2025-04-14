const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  appointmentId: { type: Number, unique: true },
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
  doctorName: { type: String, required: true }, // Identifies the doctor uniquely

  date: { type: String, required: true }, // YYYY-MM-DD format
  startTime: { type: String, required: true }, // HH:MM AM/PM format

  medicines: {
    complain: { type: String }, // Complaint or illness
    remedies: [
      {
        medicineName: { type: String }, // Medicine name
        dosage: { type: String, default: "" }, // Dosage (e.g., 500mg)
        frequency: { type: String, default: "" }, // e.g., "Twice a Day"
        quantity: { type: String, default: "" }, // e.g., "Twice a Day"
        price: { type: String, default: "" }, // e.g., "Twice a Day"
        unit: { type: String, default: "" }, // e.g., "Twice a Day"
        remediesId: { type: String, default: "" }, // e.g., "Twice a Day"
        potency: { type: String, default: "" }, // Potency (e.g., High, Medium, Low)
      },
    ],
    duration: { type: String, default: "" }, // e.g., "5 Days"
    pharmacyName: { type: String, default: "" }, // e.g., "5 Days"
    pharmacyId: { type: String, default: "" }, // e.g., "5 Days"
    instructions: { type: String }, // Additional instructions (optional)
    showMedicine: { type: String, default: "No" }, // Additional instructions (optional)
  },
  reportImageUrls: [{ type: String }],
  appointmentFee: { type: String, default: 1 },
  appointmentPaymentStatus: { type: String, default: "Pending" },
  appointmentPaymentId: { type: String },
  appointmentOrderId: { type: String, default: "" },
  appointmentPaymentMode: { type: String, default: "upi" },
  appointmentStatus: { type: String, default: "Booked" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);

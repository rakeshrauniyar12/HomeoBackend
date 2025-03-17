const mongoose = require("mongoose");

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  complain: { type: String },
  remedies: { type: String },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  potency: { type: String },
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  patientName: { type: String },
  doctorEmail: { type: String },
  medicine: { type: MedicineSchema },
  paymentMethod: {
    type: String,
    default: "Select Payment Method",
  },
  createdAt: { type: Date, default: Date.now },
});

// Pharmacy Schema
const PharmacySchema = new mongoose.Schema({
  pharmacyName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  orders: [OrderSchema],
  remedies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Remedies" }],
});

// Export the Pharmacy model
const Pharmacy = mongoose.model("Pharmacy", PharmacySchema);

module.exports = Pharmacy;

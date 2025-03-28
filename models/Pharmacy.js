const mongoose = require("mongoose");

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  complain: { type: String },
  remedies: [
    {
      medicineName: { type: String },
      dosage: { type: String },
      frequency: { type: String },
    }
  ],
  potency: { type: String },
  duration: { type: String },
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  patientName: { type: String },
  doctorEmail: { type: String },
  medicine: MedicineSchema,
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
});

// Export the Pharmacy model
const Pharmacy = mongoose.model("Pharmacy", PharmacySchema);

module.exports = Pharmacy;

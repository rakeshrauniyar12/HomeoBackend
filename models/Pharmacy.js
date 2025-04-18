const mongoose = require("mongoose");

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderId: { type: Number, default: "" },
  appointmentId: { type: String, default: "" },
  pharmacyId: { type: String, default: "" },
  paymentStatus: { type: String, default: "Pending" },
  orderStatus: { type: String, default: "Pending" },
  orderPaymentImageUrl: { type: String, default: "" },
  totalPrice: { type: String, default: "" },
  orderPaymentId: { type: String, default: "" },
  paymentMode: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Pharmacy Schema
const PharmacySchema = new mongoose.Schema({
  pharmacyName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "12345" },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  remediesOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "RemediesOrder" }],
  remedies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Remedies" }],
});


const Order = mongoose.model("Order", OrderSchema);
const Pharmacy = mongoose.model("Pharmacy", PharmacySchema);
module.exports = { Pharmacy, Order };

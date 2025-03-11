const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  password: {
    type: String,
    default:"hello"
  },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }], // Link to Appointments
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);

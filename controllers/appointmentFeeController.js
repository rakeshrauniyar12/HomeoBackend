const AppointmentFee = require("../models/AppointmentFee");

// Add a new appointment fee
const addAppointmentFee = async (req, res) => {
  try {
    const { consultationType, consultationFee } = req.body;
    const newFee = new AppointmentFee({ consultationType, consultationFee });
    await newFee.save();
    res.status(201).json({ message: "Appointment fee added", data: newFee });
  } catch (error) {
    res.status(500).json({ message: "Error adding fee", error });
  }
};

// Update fee by ID
const updateAppointmentFee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id",id)
    const { consultationFee } = req.body;

    const updatedFee = await AppointmentFee.findByIdAndUpdate(
      id,
      { consultationFee },
      { new: true }
    );
  console.log("After Fee",updatedFee)
    if (!updatedFee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    res.status(200).json({ message: "Fee updated", data: updatedFee });
  } catch (error) {
    res.status(500).json({ message: "Error updating fee", error });
  }
};

// Delete fee by ID
const deleteAppointmentFee = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFee = await AppointmentFee.findByIdAndDelete(id);

    if (!deletedFee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    res.status(200).json({ message: "Fee deleted", data: deletedFee });
  } catch (error) {
    res.status(500).json({ message: "Error deleting fee", error });
  }
};

// Get all appointment fees
const getAllAppointmentFees = async (req, res) => {
  try {
    const fees = await AppointmentFee.find().sort({ createdAt: -1 });
    res.status(200).json({ data: fees });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fees", error });
  }
};

// Get fee by ID or consultation type
const getFeeById = async (req, res) => {
  try {
    const { id } = req.paramas;


     let fee = await AppointmentFee.findById(id);

    res.status(200).json({ data: fee });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving fee", error });
  }
};

module.exports = {
  addAppointmentFee,
  updateAppointmentFee,
  deleteAppointmentFee,
  getAllAppointmentFees,
  getFeeById,
};

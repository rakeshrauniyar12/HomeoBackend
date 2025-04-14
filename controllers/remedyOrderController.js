const RemediesOrder = require("../models/RemediesOrder");
const { Pharmacy } = require("../models/Pharmacy.js");
const SuperRemedies = require("../models/SuperRemedies");
// Add a new remedy order
const addRemedyOrder = async (req, res) => {
  try {
    const existingPharmacy = await Pharmacy.findOne({
      email: req.body.pharmacyEmail,
    });
    if (!existingPharmacy) {
      return res.status(400).json({ message: "Pharmacy not found." });
    }
    const newOrder = new RemediesOrder(req.body);
    newOrder.pharmacyStatus = "Created";
    const savedOrder = await newOrder.save();
    existingPharmacy.remediesOrders.push(savedOrder._id);
    existingPharmacy.save();
    return res.status(201).json(savedOrder);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error adding remedy order", error: err });
  }
};

// Get all orders by pharmacy email
const getAllByPharmacyEmail = async (req, res) => {
  const { pharmacyEmail } = req.params;
  try {
    const orders = await RemediesOrder.find({ pharmacyEmail });
    return res.status(200).json(orders);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching orders", error: err });
  }
};

// Update pharmacyStatus by pharmacyEmail and remedyId
const updateOrderByPharmacyEmail = async (req, res) => {
  const { pharmacyEmail, id } = req.params;
  const updateData = req.body; // Contains any fields to update
  if (req.body.adminStatus) {
    const res = await SuperRemedies.findOne({
      remediesName: req.body.remedyName,
    });
    res.quantity -= req.body.quantity;
    res.save();
  }
  try {
    const updated = await RemediesOrder.findOneAndUpdate(
      { _id: id, pharmacyEmail },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating order", error: err });
  }
};

const deleteByPharmacyEmailAndId = async (req, res) => {
  const { pharmacyEmail, id } = req.params;

  try {
    const deleted = await RemediesOrder.findOneAndDelete({
      _id: id,
      pharmacyEmail,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res
      .status(200)
      .json({ message: "Order deleted successfully", deleted });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting order", error: err });
  }
};

module.exports = {
  addRemedyOrder,
  getAllByPharmacyEmail,
  updateOrderByPharmacyEmail,
  deleteByPharmacyEmailAndId,
};

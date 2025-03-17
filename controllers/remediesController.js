const mongoose = require("mongoose");
const Remedies = require("../models/Remedies");
const Pharmacy = require("../models/Pharmacy"); // Assuming you have a Pharmacy model

// ✅ Add remedies to a pharmacy
const addRemedies = async (req, res) => {
  try {
    const { pharmacyEmail, remedyName, quantity } = req.body;

    // Find the pharmacy by email
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy) {
      return res
        .status(404)
        .json({ success: false, message: "Pharmacy not found" });
    }

    // Check if a remedy with the same name exists in the Remedies collection
    let remedy = await Remedies.findOne({ remediesName: remedyName });

    if (!remedy) {
      // If remedy does not exist, create a new one
      remedy = new Remedies({ remediesName: remedyName, quantity });
      await remedy.save();
    } else {
      // If remedy already exists, you can update the quantity (optional)
      remedy.quantity = quantity;
      await remedy.save();
    }

    // Check if the remedy ID is already linked to the pharmacy
    const remedyExists = pharmacy.remedies.some((id) => id.equals(remedy._id));
    if (remedyExists) {
      return res.status(400).json({
        success: false,
        message: "Remedy already exists in the pharmacy",
      });
    }

    // Add the remedy's ObjectId to the pharmacy's remedies array
    pharmacy.remedies.push(remedy._id);
    await pharmacy.save();

    return res
      .status(200)
      .json({ success: true, message: "Remedy added successfully", pharmacy });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error adding remedy: ${error.message}`,
    });
  }
};

// ✅ Update a remedy by ID
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRemedy = await Remedies.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRemedy) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found" });
    }

    return res.status(200).json({ success: true, remedy: updatedRemedy });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating remedy: ${error.message}`,
    });
  }
};

// ✅ Get a remedy by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const remedy = await Remedies.findById(id);

    if (!remedy) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found" });
    }

    return res.status(200).json({ success: true, remedy });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error fetching remedy: ${error.message}`,
    });
  }
};

// ✅ Get all remedies
const getAll = async (req, res) => {
  try {
    const remedies = await Remedies.find();
    return res.status(200).json({ success: true, remedies });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error fetching remedies: ${error.message}`,
    });
  }
};

// ✅ Delete a remedy by ID
const deleteById = async (req, res) => {
  try {
    const { pharmacyEmail, id } = req.params;

    // Find the pharmacy by email
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy) {
      return res
        .status(404)
        .json({ success: false, message: "Pharmacy not found" });
    }

    // Check if the remedy exists in this pharmacy's remedies list
    const remedyIndex = pharmacy.remedies.indexOf(id);
    if (remedyIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found in this pharmacy" });
    }

    // Remove the remedy from the pharmacy's remedies array
    pharmacy.remedies.splice(remedyIndex, 1);
    await pharmacy.save();

    // Delete the remedy from the Remedies collection
    const deletedRemedy = await Remedies.findByIdAndDelete(id);
    if (!deletedRemedy) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Remedy not found in Remedies collection",
        });
    }

    return res.status(200).json({
      success: true,
      message: "Remedy removed from pharmacy and deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting remedy: ${error.message}`,
    });
  }
};

module.exports = { addRemedies, updateById, getById, getAll, deleteById };

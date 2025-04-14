const mongoose = require("mongoose");
const Remedies = require("../models/Remedies");
const SuperRemedies = require("../models/SuperRemedies");
const { Pharmacy } = require("../models/Pharmacy");

// ✅ Add remedies to a pharmacy
const addRemedies = async (req, res) => {
  try {
    const {
      pharmacyEmail,
      remedyName,
      potency,
      quantity,
      unit,
      adminRemediesId,
    } = req.body;

    // Find the pharmacy by email
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy) {
      return res
        .status(404)
        .json({ success: false, message: "Pharmacy not found" });
    }

    let checkAdmin = await SuperRemedies.findById(adminRemediesId);

    // Check if a remedy with the same name exists in the Remedies collection
    let checkRemedy = await Remedies.findOne({ remediesName: remedyName });

    let remedy;

    if (!checkRemedy) {
      remedy = new Remedies({
        remediesName: remedyName,
        quantity,
        potency,
        unit,
      });
      await remedy.save(); // Don't forget to save the new remedy
    } else {
      checkRemedy.quantity =
        parseInt(checkRemedy.quantity) + parseInt(quantity); // cast to number if needed
      await checkRemedy.save();
      remedy = checkRemedy;
    }
    if (parseInt(checkAdmin.quantity) >= parseInt(quantity)) {
      checkAdmin.quantity = (
        parseInt(checkAdmin.quantity) - parseInt(quantity)
      ).toString(); // convert back to string if needed
      await checkAdmin.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Not enough remedy quantity in admin stock",
      });
    }
    if (pharmacy.remedies.includes(remedy._id)) {
      return res.status(400).json({
        success: false,
        message: "Remedy already exists in the pharmacy",
      });
    }

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
const getAllRemedies = async (req, res) => {
  try {
    const remedies = await Remedies.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(remedies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch remedies", error });
  }
};
// ✅ Update a remedy by ID
const updateById = async (req, res) => {
  try {
    const { pharmacyEmail, id } = req.params;
    const updateData = req.body;

    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy || !pharmacy.remedies.includes(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found in pharmacy" });
    }

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
    const { pharmacyEmail, id } = req.params;
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy || !pharmacy.remedies.includes(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found in pharmacy" });
    }

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

// ✅ Get all remedies for a pharmacy
const getAll = async (req, res) => {
  try {
    const { pharmacyEmail } = req.params;
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail }).populate(
      "remedies"
    );
    if (!pharmacy) {
      return res
        .status(404)
        .json({ success: false, message: "Pharmacy not found" });
    }
    console.log("Pharm", pharmacy);
    console.log("Pharm", pharmacy.remedies);
    return res.status(200).json({ success: true, remedies: pharmacy.remedies });
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
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });
    if (!pharmacy) {
      return res
        .status(404)
        .json({ success: false, message: "Pharmacy not found" });
    }

    const remedyIndex = pharmacy.remedies.indexOf(id);
    if (remedyIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Remedy not found in pharmacy" });
    }

    pharmacy.remedies.splice(remedyIndex, 1);
    await pharmacy.save();

    await Remedies.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Remedy removed successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting remedy: ${error.message}`,
    });
  }
};

module.exports = {
  addRemedies,
  getAllRemedies,
  updateById,
  getById,
  getAll,
  deleteById,
};

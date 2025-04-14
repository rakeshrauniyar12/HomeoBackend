const SuperRemedies = require("../models/SuperRemedies");

// Add Remedy
const addRemedy = async (req, res) => {
  try {
    const { remediesName, quantity, unit } = req.body;
    if (!remediesName || !quantity || !unit) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for duplicate remedy name
    const existingRemedy = await SuperRemedies.findOne({
      remediesName: remediesName.trim().toUpperCase(),
    });
    if (existingRemedy) {
      return res
        .status(409)
        .json({ message: "Remedy with the same name already exists." });
    }

    const newRemedy = new SuperRemedies({
      remediesName: remediesName.trim().toUpperCase(),
      quantity,
      unit,
    });

    await newRemedy.save();

    res
      .status(201)
      .json({ message: "Remedy added successfully", data: newRemedy });
  } catch (error) {
    res.status(500).json({ message: "Error adding remedy", error });
  }
};

// Update Remedy (add to existing quantity if quantity is provided)
const updateRemedy = async (req, res) => {
  try {
    const { id } = req.params;
    const { remediesName, quantity, unit } = req.body;
    const remedy = await SuperRemedies.findById(id);
    if (!remedy) {
      return res.status(404).json({ message: "Remedy not found" });
    }

    if (remediesName) remedy.remediesName = remediesName;
    if (unit) remedy.unit = unit;

    // If quantity is present, add to existing quantity
    if (quantity) {
      const existingQty = parseFloat(remedy.quantity);
      const addQty = parseFloat(quantity);
      remedy.quantity = (existingQty + addQty).toString();
    }

    await remedy.save();
    res
      .status(200)
      .json({ message: "Remedy updated successfully", data: remedy });
  } catch (error) {
    res.status(500).json({ message: "Error updating remedy", error });
  }
};

// Delete Remedy
const deleteRemedy = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SuperRemedies.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Remedy not found" });
    }

    res.status(200).json({ message: "Remedy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting remedy", error });
  }
};

// Get All Remedies
const getAllRemedies = async (req, res) => {
  try {
    const remedies = await SuperRemedies.find();
    res.status(200).json({ data: remedies });
  } catch (error) {
    res.status(500).json({ message: "Error fetching remedies", error });
  }
};

module.exports = {
  addRemedy,
  updateRemedy,
  deleteRemedy,
  getAllRemedies,
};

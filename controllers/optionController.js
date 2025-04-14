const Option = require("../models/Option.js");

// Add options (array input)
const addOptions = async (req, res) => {
  try {
    const { field, value } = req.body;

    if (!["potency", "repetition", "dosage", "days", "unit"].includes(field)) {
      return res.status(400).json({ message: "Invalid field name" });
    }

    const valuesArray = Array.isArray(value)
      ? value.map((v) => v.trim()).filter((v) => v)
      : value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);

    let option = await Option.findOne();

    if (option) {
      // Avoid duplicates
      const existingValues = new Set(option[field]);
      const newValues = valuesArray.filter((v) => !existingValues.has(v));
      option[field].push(...newValues);
      await option.save();
      return res
        .status(200)
        .json({ message: `${field} options added`, data: option });
    } else {
      const newOption = new Option({ [field]: valuesArray });
      await newOption.save();
      return res
        .status(201)
        .json({ message: `${field} created with options`, data: newOption });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update option", error: err.message });
  }
};

// Get all options
const getAllOptions = async (req, res) => {
  try {
    const options = await Option.find().sort({ createdAt: -1 });
    res.status(200).json(options);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch options", error: err.message });
  }
};

// Delete by field and value
const deleteOptionByField = async (req, res) => {
  try {
    const { field, index } = req.body;
    console.log("Fiel", field);
    const validFields = ["potency", "repetition", "dosage", "days", "unit"];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: "Invalid field specified" });
    }

    // Fetch the document (assuming only one Option document exists)
    const optionDoc = await Option.findOne();

    if (!optionDoc || !Array.isArray(optionDoc[field])) {
      return res.status(404).json({ message: "Option field not found" });
    }

    if (index < 0 || index >= optionDoc[field].length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Remove item at the index
    optionDoc[field].splice(index, 1);

    // Save the updated document
    await optionDoc.save();

    res.status(200).json({
      message: `Deleted item at index ${index} from '${field}'`,
      data: optionDoc[field],
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to delete option by index",
        error: err.message,
      });
  }
};

module.exports = {
  addOptions,
  getAllOptions,
  deleteOptionByField,
};

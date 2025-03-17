const express = require("express");
const router = express.Router();
const {
  addRemedies,
  updateById,
  getById,
  getAll,
  deleteById,
} = require("../controllers/remediesController");

// ✅ Add a remedy to a pharmacy
router.post("/add", addRemedies);

// ✅ Update a remedy by ID
router.put("/update/:id", updateById);

// ✅ Get a remedy by ID
router.get("/get/:id", getById);

// ✅ Get all remedies
router.get("/getAll", getAll);

// ✅ Delete a remedy by ID
router.delete("/delete/:pharmacyEmail/:id", deleteById);

module.exports = router;

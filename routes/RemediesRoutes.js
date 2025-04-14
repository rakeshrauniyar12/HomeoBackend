const express = require("express");
const router = express.Router();
const {
  addRemedies,
  updateById,
  getById,
  getAll,
  deleteById,
  getAllRemedies,
} = require("../controllers/remediesController");

// ✅ Add a remedy to a pharmacy
router.post("/add", addRemedies);

// ✅ Update a remedy by ID (requires pharmacy email)
router.put("/update/:pharmacyEmail/:id", updateById);

// ✅ Get a remedy by ID (requires pharmacy email)
router.get("/get/:pharmacyEmail/:id", getById);
router.get("/getall", getAllRemedies);

// ✅ Get all remedies for a pharmacy
router.get("/getAll/:pharmacyEmail", getAll);

// ✅ Delete a remedy by ID (requires pharmacy email)
router.delete("/delete/:pharmacyEmail/:id", deleteById);

module.exports = router;

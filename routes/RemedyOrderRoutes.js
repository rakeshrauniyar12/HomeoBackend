const express = require("express");
const router = express.Router();
const {
  addRemedyOrder,
  getAllByPharmacyEmail,
  updateOrderByPharmacyEmail,
  deleteByPharmacyEmailAndId,
} = require("../controllers/remedyOrderController");

// Add a new remedy order
router.post("/add", addRemedyOrder);

// Get all remedy orders by pharmacy email
router.get("/all/:pharmacyEmail", getAllByPharmacyEmail);

// Update pharmacy status by pharmacyEmail and remedyId
router.put(
  "/updatestatus/:pharmacyEmail/:id",
  updateOrderByPharmacyEmail
);

// Delete order by pharmacyEmail and remedyId
router.delete("/delete/:pharmacyEmail/:id", deleteByPharmacyEmailAndId);

module.exports = router;

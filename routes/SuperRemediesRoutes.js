const express = require("express");
const router = express.Router();
const {
  addRemedy,
  updateRemedy,
  deleteRemedy,
  getAllRemedies,
} = require("../controllers/superRemediesController.js");

router.post("/add", addRemedy);
router.put("/update/:id", updateRemedy);
router.delete("/delete/:id", deleteRemedy);
router.get("/getall", getAllRemedies);

module.exports = router;

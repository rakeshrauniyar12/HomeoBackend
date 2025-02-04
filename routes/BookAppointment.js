const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Define routes
router.post("/add", appointmentController.addAppointment);
router.get("/:id", appointmentController.viewAppointment);
router.put("/update/:id", appointmentController.updateAppointment);
router.delete("/delete/:id", appointmentController.deleteAppointment);
router.get("/getbookedtimeslot", appointmentController.getBookedTimeSlots);

module.exports = router;

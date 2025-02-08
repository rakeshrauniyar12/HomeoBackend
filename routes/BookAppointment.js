const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Define routes
router.post("/add", appointmentController.addAppointment);
router.get("/getappointment/:id", appointmentController.viewAppointment);
router.get("/getappointmentbyemail/:email", appointmentController.getAppointmentsByEmail);
router.get("/getallappointment", appointmentController.getAllAppointments);
router.put("/update/:id", appointmentController.updateAppointment);
router.delete("/delete/:id", appointmentController.deleteAppointment);
router.get("/getbookedtimeslot", appointmentController.getBookedTimeSlots);

module.exports = router;

const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Define routes
router.post("/add", appointmentController.addAppointment);
router.get("/getappointment/:userId/:id", appointmentController.getAppointmentById);
router.get("/getallappointment", appointmentController.getAllAppointments);
router.put("/update/:useremail/:id", appointmentController.updateAppointment);
router.put("/update", appointmentController.updateAppointmentTime);
router.put("/addmedicines/:useremail/:id", appointmentController.addMedicineToAppointment);
router.delete("/delete/:userId/:id", appointmentController.deleteAppointment);
// router.get("/getbookedtimeslot", appointmentController.getBookedTimeSlots);

module.exports = router;

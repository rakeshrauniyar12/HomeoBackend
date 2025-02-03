const express = require("express");
const {
  bookAppointment,
  viewAppointmentsByUserEmail,
  viewAllAppointments,
  updateAppointmentById,
} = require("../controllers/appointmentController");

const router = express.Router();

// Book Appointment
router.post("/book", bookAppointment);

// View Appointments by User Email
router.get("/getByEmail/:email", viewAppointmentsByUserEmail);

// View All Appointments
router.get("/getAllAppointments", viewAllAppointments);

// Update Appointment (Supports Partial Updates)
router.patch("/update/:appointmentId", updateAppointmentById);

module.exports = router;

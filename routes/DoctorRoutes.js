const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

router.post("/add", doctorController.addDoctor);
router.get("/getall", doctorController.getAllDoctors);
router.get("/getdoctoremail/:email", doctorController.getDoctorByEmail);
router.get("/gettimeslot/:email/:date", doctorController.getTimeSlot);
router.get("/getallappointment/:email", doctorController.getAllAppointmentsByDoctorEmail);
router.put("/update/:doctorId", doctorController.updateDoctor);
router.put("/updateschedule", doctorController.updateDoctorSchedule);
router.delete("/delete/:id", doctorController.deleteDoctor);

module.exports = router;

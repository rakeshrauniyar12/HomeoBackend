const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

router.post("/add", doctorController.addDoctor);
router.get("/getall", doctorController.getAllDoctors);
router.post("/getdoctoremail", doctorController.getDoctorByEmail);
router.get("/getdoctortoken", doctorController.getDoctorByToken);
router.get("/gettimeslot/:email/:date", doctorController.getTimeSlot);
router.get("/getallappointment/:email", doctorController.getAllAppointmentsByDoctorEmail);
router.put("/update/:doctorId", doctorController.updateDoctor);
router.put("/updateschedule", doctorController.updateDoctorSchedule);
router.get("/getschedule/:doctorId", doctorController.getScheduleByDoctorId);
router.put("/updatescheduleslot/:doctorId", doctorController.updateScheduleSlot);
router.delete("/delete/:id", doctorController.deleteDoctor);
router.post("/forgotpassword", doctorController.forgotPassword);

module.exports = router;

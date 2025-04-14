const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointmentFeeController");

router.post("/add", controller.addAppointmentFee);
router.put("/update/:id", controller.updateAppointmentFee);
router.delete("/delete/:id", controller.deleteAppointmentFee);
router.get("/all", controller.getAllAppointmentFees);
router.get("/get/:id", controller.getFeeById); // pass ?id=... or ?consultationType=...

module.exports = router;

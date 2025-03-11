const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

router.post("/send-otp", otpController.sendOtp);
router.post("/validate-otp", otpController.validateOtp);

module.exports = router;
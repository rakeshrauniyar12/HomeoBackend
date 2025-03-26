const express = require("express");
const {
  phonePePayment,
  phonePePaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/phonepe", phonePePayment);
router.post("/status/:txnId", phonePePaymentStatus);

module.exports = router;
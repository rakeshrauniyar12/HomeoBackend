const express = require("express");
const router = express.Router();
const pharmacyController = require("../controllers/pharmacyController");

// Define routes
router.post("/add", pharmacyController.addPharmacy);
router.put("/updatepaymentmethod", pharmacyController.updatePaymentMethod);
router.get("/getpharmacy/:email", pharmacyController.getPharmacyByEmail);
router.get(
  "/getallorders/:email",
  pharmacyController.viewAllOrdersByPharmacyEmail
);
router.get(
  "/getallorder/:pharmacyId/:orderId",
  pharmacyController.fetchOrderByPharmacyIdAndOrderId
);
router.get("/getallpharmacy", pharmacyController.getAllPharmacies);
router.put("/update/:id", pharmacyController.updatePharmacyFields);
router.post("/addorder/:id", pharmacyController.addOrderToPharmacy);

module.exports = router;

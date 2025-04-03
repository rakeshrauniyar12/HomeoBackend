const express = require("express");
const router = express.Router();
const pharmacyController = require("../controllers/pharmacyController");

// Define routes
router.post("/add", pharmacyController.addPharmacy);
router.get("/getpharmacy/:email", pharmacyController.getPharmacyByEmail);
router.get(
  "/getallorders/:email",
  pharmacyController.viewAllOrdersByPharmacyEmail
);
router.get(
  "/getallpendingorders/:email",
  pharmacyController.viewPendingOrdersByPharmacyEmail
);
router.get(
  "/getallcompletedorders/:email",
  pharmacyController.viewCompletedOrdersByPharmacyEmail
);
router.get(
  "/getallcompletedorders/:id",
  pharmacyController.viewCompletedOrdersByPharmacyId
);
router.get(
  "/getallorder/:pharmacyId/:orderId",
  pharmacyController.fetchOrderByPharmacyIdAndOrderId
);
router.get("/getallpharmacy", pharmacyController.getAllPharmacies);
router.put("/update/:id", pharmacyController.updatePharmacyFields);
router.put("/updateorder", pharmacyController.updateOrderPharmacy);
router.post("/addorder/:id", pharmacyController.addOrderToPharmacy);
router.post("/forgotpassword", pharmacyController.forgotPassword);

module.exports = router;

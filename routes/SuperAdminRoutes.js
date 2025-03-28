const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");

router.post("/register", superAdminController.register);
router.post("/login", superAdminController.login);
router.get("/get", superAdminController.getUserDetails);

module.exports = router;
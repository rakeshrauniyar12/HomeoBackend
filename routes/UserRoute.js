const express = require("express");
const {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUserById,
  getUserDetails,
  getUserAppointmentsByEmail,
  getAllAppointmentsFromUsers
} = require("../controllers/UserController");

const router = express.Router();

// Register route
router.post("/register", registerUser);
router.patch("/updatepassword/:userId", updateUserById);
router.post("/login", loginUser);
router.get("/getUserById/:userId", getUserById);
router.get("/getUser/:email", getUserAppointmentsByEmail);
router.get("/getUserAllAppointment", getAllAppointmentsFromUsers);
router.get("/getAllUser", getAllUsers);
router.get("/getuser", getAllUsers);

module.exports = router;

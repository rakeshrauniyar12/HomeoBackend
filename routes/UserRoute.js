const express = require("express");
const {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUserById,
} = require("../controllers/UserController");

const router = express.Router();

// Register route
router.post("/register", registerUser);
router.patch("/updatepassword/:userId", updateUserById);
router.post("/login", loginUser);
router.get("/getUserById/:userId", getUserById);
router.get("/getAllUser", getAllUsers);

module.exports = router;

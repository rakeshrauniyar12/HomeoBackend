const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, age, gender, password } =
      req.body;
    if (!password) {
      password = "hello";
    }
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      age,
      gender,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update User by ID (Patch Method)
const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // Get the token from headers
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user by ID
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
const getUserAppointmentsByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Assuming email is passed as a parameter
    const user = await User.findOne({ email }).populate("appointments");
     // Populate appointments
    console.log(user);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      // Return only the appointments
      res.json(user.appointments);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAppointmentsFromUsers = async (req, res) => {
  try {
    // Fetch all users and populate their appointments
    const users = await User.find().populate("appointments");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users or appointments found" });
    }

    // Combine all appointments into a single array
    const allAppointments = users.flatMap((user) => user.appointments);

    res.json(allAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserById,
  getUserAppointmentsByEmail,
  getAllAppointmentsFromUsers,
  getUserById,
  getAllUsers,
  getUserDetails,
};

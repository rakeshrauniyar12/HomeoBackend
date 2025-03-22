const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Import routes
const userRoute = require("./routes/UserRoute");
const appointmentRoute = require("./routes/BookAppointment.js");
const doctorRoute = require("./routes/DoctorRoutes.js");
const pharmacyRoute = require("./routes/PharmacyRoutes.js");
const otpRoute = require("./routes/OtpRoutes.js");
const remediesRoute = require("./routes/RemediesRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Connect to the database
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "https://homeop.vercel.app",
    "https://drrkvishwakarma.com",
    "https://homeopadmin.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Fixed 'methods'
  credentials: true, // Allow credentials (cookies, authorization headers)
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware **before** routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Routes
app.use("/api/auth", userRoute);
app.use("/api/otp", otpRoute); // Fixed duplicate "/api/auth"
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);
app.use("/api/remedies", remediesRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the authentication API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

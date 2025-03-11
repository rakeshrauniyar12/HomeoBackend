const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./routes/UserRoute");
const appointmentRoute = require("./routes/BookAppointment.js");
const doctorRoute = require("./routes/DoctorRoutes.js");
const pharmacyRoute = require("./routes/PharmacyRoutes.js");
const otpRoute = require("./routes/OtpRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

connectDB();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "https://homeop.vercel.app",
    "https://homeopadmin.vercel.app",
  ],
  method: "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use("/api/auth", userRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);
app.use("/api/auth", otpRoute);
// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the authentication API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

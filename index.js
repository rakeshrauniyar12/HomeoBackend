const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./routes/UserRoute")
const appointmentRoute = require("./routes/BookAppointment.js")


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();


app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  method: "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use("/api/auth", userRoute);
app.use("/api/appointment",appointmentRoute);
// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the authentication API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
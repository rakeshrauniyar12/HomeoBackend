const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { randomUUID } = require("crypto");

const userRoute = require("./routes/UserRoute");
const appointmentRoute = require("./routes/BookAppointment.js");
const doctorRoute = require("./routes/DoctorRoutes.js");
const pharmacyRoute = require("./routes/PharmacyRoutes.js");
const otpRoute = require("./routes/OtpRoutes.js");
const remediesRoute = require("./routes/RemediesRoutes.js");
const superAdminRoute = require("./routes/SuperAdminRoutes.js");
const basicAuth = require('express-basic-auth');


dotenv.config();
// const clientId = process.env.CLIENT_ID;
// const clientSecret = process.env.CLIENT_SECRET;
// const clientVersion = process.env.CLIENT_VERSION;
// console.log("Client Id", clientId);
// console.log("Client Secret", clientSecret);
// console.log("Client Version", clientVersion);

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
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware **before** routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// const env = Env.SANDBOX;
// const client = new StandardCheckoutClient(clientId, clientSecret, clientVersion, env);

// app.post("/api/payment/book/appointment", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     if (!amount) {
//       return res.status(400).send("amount required");
//     }
//     const merchantOrderId = randomUUID();
//     console.log("Generated Order ID:", merchantOrderId);
//     const redirectUrl = `http://localhost:8081/checkstatus?merchantOrderId=${merchantOrderId}`;

//     const request = StandardCheckoutPayRequest.builder()
//       .merchantOrderId(merchantOrderId)
//       .amount(amount)
//       .redirectUrl(redirectUrl)
//       .build();

//     console.log("🔄 Sending payment request...");
//     const paymentResponse = await client.pay(request);
//     console.log("✅ Payment Response:", paymentResponse);

//     return res.json({ checkoutPageUrl: paymentResponse.redirectUrl });
//   } catch (error) {
//     console.error("❌ Payment error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Payment failed", details: error.message });
//   }
// });

// app.get("/checkstatus", async (req, res) => {
//   try {
//     const { merchantOrderId } = req.query;
//     if (!merchantOrderId) {
//       return res.status(400).send("merchant order id required");
//     }

//     console.log("🔄 Checking status for:", merchantOrderId);
//     const statusResponse = await client.getOrderStatus(merchantOrderId);
//     console.log("✅ Status Response:", statusResponse);

//     if (statusResponse.status === "COMPLETED") {
//       return res.redirect("http://localhost:3000");
//     } else {
//       return res.redirect("http://localhost:3000/ourtreatment");
//     }
//   } catch (error) {
//     console.error("❌ Status Check Error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Status check failed", details: error.message });
//   }
// });

// Routes
app.use('/phonepe-webhook', basicAuth({
  users: { 'phonepe_webhook': 'SecurePass123!' },
  challenge: true
}));

app.post('/phonepe-webhook', (req, res) => {
  console.log(req.body); // Handle webhook
  res.status(200).end();
});
app.use("/api/auth", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);
app.use("/api/remedies", remediesRoute);
app.use("/api/super", superAdminRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the authentication API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

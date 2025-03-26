const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { randomUUID } = require("crypto");
const axios = require("axios");
const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");

const userRoute = require("./routes/UserRoute");
const appointmentRoute = require("./routes/BookAppointment.js");
const doctorRoute = require("./routes/DoctorRoutes.js");
const pharmacyRoute = require("./routes/PharmacyRoutes.js");
const otpRoute = require("./routes/OtpRoutes.js");
const remediesRoute = require("./routes/RemediesRoutes.js");
const superAdminRoute = require("./routes/SuperAdminRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Connect to the database
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
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
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientVersion = process.env.CLIENT_VERSION;
const env = Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Amount",amount)
    if (!amount) {
      res.status(500).send("Amount is required.");
    }
    const merchantId = randomUUID();
    // const redirectUrl = `http://localhost:8081/check-status?merchantOrderId=${merchantId}`;
    const redirectUrl = `https://homeobackend.onrender.com/check-status?merchantOrderId=${merchantId}`;
    // const redirectUrl = `http://localhost:3000`;
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();
     client.pay(request).then((response)=> {
        res.json({
          checkoutPageUrl: response.redirectUrl,
          merchantOrderId: merchantId,
        });
    });
  } catch (error) {
    console.log("Error", error);
  }
});


app.get("/check-status",async (req,res)=>{
     try {
        const {merchantOrderId} = req.query;
        if(!merchantOrderId){
          return res.status(400).send("Merchant Id is required.")

        }
        const response = await client.getOrderStatus(merchantOrderId);
        console.log(response)
        let url="https://drrkvishwakarma.com"
        // let url="http://localhost:3000"
        if (response.state === "COMPLETED") {
          const transactionId = response.paymentDetails[0].transactionId;
          const paymentMode = response.paymentDetails[0].paymentMode;
          return res.redirect(`${url}/paymentsuccess?status=success&transactionId=${transactionId}&mode=${paymentMode}`);;  // Send the URL to redirect to
          // return res.json({ redirectUrl: "http://localhost:3000" });;  // Send the URL to redirect to
        } else {
          return res.redirect(`${url}/paymentfail?status=fail`);  // Send a different URL if not completed
        }
         
     } catch (error) {
       console.log("Error",error);
     }
})
// Routes

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

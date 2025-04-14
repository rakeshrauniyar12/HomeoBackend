const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const Appointment = require("./models/Appointment.js");
const Pharmacy = require("./models/Pharmacy.js");
const appointmentController = require("./controllers/appointmentController.js");

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
const optionRoute = require("./routes/OptionRoutes.js");
const superRemediesRoute = require("./routes/SuperRemediesRoutes.js");
const appointmentFeeRoute = require("./routes/AppointmentFeeRoutes.js");
const remedyOrderRoute = require("./routes/RemedyOrderRoutes.js");

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
    "*",
    "http://localhost:3002",
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3004",
    "https://drrkvishwakarma.com",
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
// const env = Env.PRODUCTION;

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

app.post("/api/create-appointment", async (req, res) => {
  try {
    const { appointmentId, consultationAmount } = req.body;
    console.log("Amount", consultationAmount);
    console.log("appoi", appointmentId);
    let updatedAmount = consultationAmount * 100;
    if (!updatedAmount) {
      res.status(500).send("Amount is required.");
    }
    const merchantId = appointmentId;
    // const merchantId = randomUUID();
    console.log("Mercha", merchantId);
    const redirectUrl = `http://localhost:8081/check-status-appointment?merchantOrderId=${merchantId}`;
    // const redirectUrl = `https://api.drrkvishwakarma.com/check-status-appointment?merchantOrderId=${merchantId}`;
    // const redirectUrl = `http://localhost:3000`;
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantId)
      .amount(updatedAmount)
      .redirectUrl(redirectUrl)
      .build();
    client.pay(request).then((response) => {
      res.json({
        checkoutPageUrl: response.redirectUrl,
        merchantOrderId: merchantId,
      });
    });
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/check-status-appointment", async (req, res) => {
  try {
    const { merchantOrderId } = req.query;
    if (!merchantOrderId) {
      return res.status(400).send("Merchant Id is required.");
    }
    const response = await client.getOrderStatus(merchantOrderId);
    console.log(response);
    // let url = "https://drrkvishwakarma.com";
    let url = "http://localhost:3000";
    if (response.state === "COMPLETED") {
      const transactionId = response.paymentDetails[0].transactionId;
      const paymentMode = response.paymentDetails[0].paymentMode;
      const appointment = await Appointment.findById(merchantOrderId);
      if (appointment) {
        appointment.appointmentPaymentStatus = "Success";
        appointment.appointmentPaymentId = transactionId;
        appointment.appointmentPaymentMode = paymentMode;
        // appointmentController.sendAppointmentEmails(appointment);
        appointment.save();
        return res.redirect(`${url}/#/paymentsuccess`); // Send the URL to redirect to
      }
    } else {
      const appointment = await Appointment.findById(merchantOrderId);
      // const appointment = await Appointment.findByIdAndDelete(merchantOrderId);
      appointmentController.deleteAppointmentIfPaymentFail(
        merchantOrderId,
        appointment.email
      );
      return res.redirect(`${url}/#/paymentfail`); // Send a different URL if not completed
    }
  } catch (error) {
    console.log("Error", error);
  }
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { pharmacyId, orderId, amount } = req.body;
    console.log("Amount", amount);
    console.log("appoi", orderId);
    console.log("pharmacy", pharmacyId);
    if (!amount) {
      res.status(500).send("Amount is required.");
    }
    const merchantId = orderId;
    // const merchantId = randomUUID();
    console.log("Mercha", merchantId);
    // const redirectUrl = `http://localhost:8081/check-status-order?merchantOrderId=${merchantId}&pharmacyId=${pharmacyId}`;
    const redirectUrl = `https://api.drrkvishwakarma.com/check-status-order?merchantOrderId=${merchantId}&pharmacyId=${pharmacyId}`;
    // const redirectUrl = `http://localhost:3000`;
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();
    client.pay(request).then((response) => {
      res.json({
        checkoutPageUrl: response.redirectUrl,
        merchantOrderId: merchantId,
      });
    });
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/check-status-order", async (req, res) => {
  try {
    const { merchantOrderId, pharmacyId } = req.query;
    if (!merchantOrderId) {
      return res.status(400).send("Merchant Id is required.");
    }
    const response = await client.getOrderStatus(merchantOrderId);
    console.log("Line 170", response);
    let url = "https://drrkvishwakarma.com";
    // let url = "http://localhost:3000";
    if (response.state === "COMPLETED") {
      console.log("Line 174", response);
      const transactionId = response.paymentDetails[0].transactionId;
      // const paymentMode = response.paymentDetails[0].paymentMode;
      const pharmacy = await Pharmacy.findById(
        new mongoose.Types.ObjectId(pharmacyId)
      );
      if (pharmacy) {
        console.log("Line 179", pharmacy);
        console.log("Line 179", pharmacy.orders);
        const order = pharmacy.orders.find(
          (order) => order._id.toString() === merchantOrderId
        );
        if (order) {
          console.log("Line 185", order);
          order.paymentStatus = "Completed";
          order.orderPaymentId = transactionId;
          await pharmacy.save(); // Save updated order status
          return res.redirect(`${url}/#/myappointment`);
        } else {
          console.log("Order not found!");
          return res.redirect(`${url}/#/myappointment`);
        } // Send the URL to redirect to
      } else {
        console.log("Pharmacy not found");
      }
      // return res.redirect(`${url}/#/paymentsuccess`);
      // return res.json({ redirectUrl: "http://localhost:3000" });;  // Send the URL to redirect to
    } else {
      // const appointment = await Appointment.findByIdAndDelete(merchantOrderId);

      return res.redirect(`${url}/#/myappointment`); // Send a different URL if not completed
    }
  } catch (error) {
    console.log("Error", error);
  }
});
// Routes

app.use("/api/auth", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);
app.use("/api/remedies", remediesRoute);
app.use("/api/super", superAdminRoute);
app.use("/api/option", optionRoute);
app.use("/api/superremedies", superRemediesRoute);
app.use("/api/appointmentfee", appointmentFeeRoute);
app.use("/api/remedyorder", remedyOrderRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the authentication API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

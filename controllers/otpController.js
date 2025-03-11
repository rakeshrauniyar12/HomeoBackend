const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");


exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  const otpEntry = new Otp({ email, otp });
  await otpEntry.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: "rakeshrauniyara1234@gmail.com",
      pass: "zdcigsehtwkzuizz",
    },
  });

  await transporter.sendMail({
    from: "rakeshrauniyara1234@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  });

  res.status(200).json({ message: "OTP sent to your email" });
};

exports.validateOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    await Otp.deleteOne({ _id: otpEntry._id });

    res.status(200).json({ message: "OTP validated." });
  } catch (error) {
    console.error("Error validating OTP:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
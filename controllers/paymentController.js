const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");

exports.phonePePaymentStatus = async (req, res) => {
  const { txnId } = req.params;
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;

  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${txnId}` + saltKey;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${txnId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const url = "http://localhost:3000";
        // const url = "https://lifesignify.com/payment-success";
        return res.redirect(url);
      } else {
        const url = "http://localhost:3000/ourtreatment";
        // const url = "https://lifesignify.com/payment-failure";
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

exports.phonePePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;

    const transactionId = `TXN_${Date.now()}`;
    const merchantUserId = `MUID${"ahhdkkjd"}${Date.now()}`;

    // const totalAmount = products.reduce(
    //   (total, product) =>
    //     total +
    //     parseFloat(product.price.replace("₹", "").replace(",", "").trim()) *
    //       100,
    //   0
    // );

    const requestBody = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: merchantUserId,
      amount: amount,
      redirectUrl: `http://localhost:8081/api/payment/status/${transactionId}`,
      redirectMode: "POST",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
   console.log("Request Body",requestBody)
    const payload = JSON.stringify(requestBody);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
      return res.redirect(
        response.data.data.instrumentResponse.redirectInfo.url
      );
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "failed to initiate payment" });
    }

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
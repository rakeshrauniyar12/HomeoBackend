const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");

import { randomUUID } from 'crypto';
import { OrderStatusResponse } from 'pg-sdk-node';

const clientId = "SU2503241524196716164701";
const clientSecret = "684b82cb-e69b-4c64-951a-dcf099009a13";
const clientVersion = 1;  //insert your client version here
const env = Env.SANDBOX;      //change to Env.PRODUCTION when you go live
 
const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);


  
const merchantOrderId = randomUUID();
const amount = 100;
const redirectUrl = "http://localhost:3000";
  
const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .build();
  
client.pay(request).then((response)=> {
    const checkoutPageUrl = response.redirectUrl;
    console.log(checkoutPageUrl);
})


 
// const merchantOrderId = '<merchantOrderId>'; //created at the time of order creation
 
client.getOrderStatus(merchantOrderId).then((response) => {
  const state = response.state;
});


const authorizationHeaderData = "ef4c914c591698b268db3c64163eafda7209a630f236ebf0eebf045460df723a" // received in the response headers
const phonepeS2SCallbackResponseBodyString = "{\"type\": \"PG_ORDER_COMPLETED\",\"payload\": {}}"  // callback body as string
  
const usernameConfigured = "<MERCHANT_USERNAME>"
const passwordConfigured = "<MERCHANT_PASSWORD>" 
 
const callbackResponse = client.validateCallback(
    usernameConfigured,
    passwordConfigured,
    authorizationHeaderData,
    phonepeS2SCallbackResponseBodyString );
 
const orderId = callbackResponse.payload.orderId;
const state = callbackResponse.payload.state;

 
const request1 = CreateSdkOrderRequest.StandardCheckoutBuilder()
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .build();
 
client.createSdkOrder(request1).then((response) => {
    const token = response.token
})



















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
    url:`https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${txnId}`,
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
        const url = "http://localhost:3000/payment-success";
        return res.redirect(url);
      } else {
        const url = "http://localhost:3000/payment-failure";
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

exports.phonePePayment = async (req, res) => {
  try {
    const { formData, products, userId } = req.body;

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;

    const transactionId = `TXN_${Date.now()}`;
    const merchantUserId = `MUID${userId}${Date.now()}`;

    const totalAmount = products.reduce(
      (total, product) =>
        total +
        parseFloat(product.price.replace("₹", "").replace(",", "").trim()) *
          100,
      0
    );

    const requestBody = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: merchantUserId,
      amount: totalAmount,
      redirectUrl: `http://localhost:8081/api/payment/status/${transactionId}`,
    //   redirectUrl: `https://lifesignify-backend.onrender.com/api/payment/status/${transactionId}`,
      redirectMode: "POST",
      mobileNumber: formData.mobilenumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

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
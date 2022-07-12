const express = require("express");
const router = express.Router();

const config = require("config");
const { User } = require("../../models");
const db = require("../../database");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: config.get("paypalClientId"),
  client_secret: config.get("paypalSecret"),
});

const paypalPayment = (amount, userId) => {
  let create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `${config.get(
        "serverUrl"
      )}/paypal_success?userId=${userId}&total=${amount}$currency=${"USD"}`,
      cancel_url: `${config.get("serverUrl")}/paypal_cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "EarnMaster Coins",
              sku: "coins",
              price: amount,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: amount,
        },
        description: "EarnMaster virtual coins",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return payment.links[i].href;
        }
      }
    }
  });
};

router.get("/paypal_success", async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const total = req.query.total;
  const userId = req.query.userId;
  const currency = req.query.currency;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: currency,
          total: total,
        },
      },
    ],
  };

  try {
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          // create a payment order and decrease user balance
          const result = await db.transaction(async (t) => {
            const user = await User.findByPk(userId);
            user.increment({ balance: +total });
            const payment = await PaymentOrder.create({
              type: type,
              amount: total,
              status: "complete",
            });
            user.addPaymentOrder(payment);
          });
          res.send("Success");
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.send("Cancelled");
  }
});

router.get("/paypal_cancel", async (req, res) => res.send("Cancelled"));

module.exports = { paypalPayment, router };

const express = require("express");
const router = express.Router();

const config = require("config");
const { User, Offer } = require("../../models");
const db = require("../../database");

router.get("/cpalead", async (req, res) => {
  const { password, subid, payout, title, offerId } = req.query;
  if (password !== config.get("cpalead_password")) {
    return res.status(400).json({ msg: "wrong password" });
  }

  try {
    rewardUser(subid, offerId, payout);
    res.status(200).end("1");
  } catch (error) {
    return res.status(400);
  }
});
router.get("/kiwiwall", async (req, res) => {
  const { sub_id, amount, status, offer_name, signature, trans_id, offer_id } =
    req.query;
  const crypto = require("crypto");
  const hash = crypto
    .createHash("md5")
    .update(`${sub_id}:${amount}:${config.get("kiwi_secret")}`)
    .digest("hex");

  if (signature !== hash) {
    return res.status(400);
  }
  try {
    rewardUser(sub_id, offer_id, amount);

    res.status(200).end("1");
  } catch (error) {
    return res.status(400);
  }
});

const rewardUser = async (userId, offerId, amount) => {
  try {
    const user = await User.findById(userId);
    const offer = await Offer.findById(offerId);
    if (!user || !offer) {
      // throw an exception
    }
    const result = await db.transaction(async (t) => {
      user.addOffer(offer);
      user.increment({ balance: +amount });
      //notify user
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = router;

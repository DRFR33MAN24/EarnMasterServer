const express = require("express");
const router = express.Router();

const config = require("config");
const { User, Offer } = require("../../models");
const db = require('../../database');


router.post("/cpalead", async (req, res) => {
  console.log(req.body);

  rewardUser(userId,offerId,amount);
});
router.post("/kiwiwall", async (req, res) => {
  console.log(req.body);
});


const rewardUser = (userId,offerId,amount)=>{
  try {
    const user = await User.findById(userId);
    const offer = await Offer.findById(offerId);
    if (!user || !offer) {
      // throw an exception
    }
    const result = await db.transaction(async (t) => {
    user.addOffer(offer);
    user.increment({balance:+amount});
    //notify user

    });
  } catch (error) {
    console.log(error)
  }
}

module.exports = router;

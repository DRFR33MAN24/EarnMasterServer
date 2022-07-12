const express = require("express");
const router = express.Router();

const config = require("config");

//const axios = require("axios");

const auth = require("../../middleware/auth");

const { Offer } = require("../../models");
router.get("/getOffers", auth, async (req, res) => {
  const { offset, country } = req.query;
  const offers = await Offer.findAndCountAll({
    where: { country: country },
    offset: offset,
    limit: 10,
  });
  res.json(offers);
});

module.exports = router;

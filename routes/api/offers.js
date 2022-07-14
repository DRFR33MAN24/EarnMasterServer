const express = require("express");
const router = express.Router();

const config = require("config");

//const axios = require("axios");

const auth = require("../../middleware/auth");

const { Offer } = require("../../models");
router.get("/getOffers", auth, async (req, res) => {
  const { offset } = req.query;

  const offers = await Offer.findAndCountAll({
    limit: 10,
    offset: parseInt(offset),
  });
  res.json(offers);
});

module.exports = router;

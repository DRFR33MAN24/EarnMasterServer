const express = require("express");
const router = express.Router();

const config = require("config");


//const axios = require("axios");

const auth = require("../../middleware/authUserMiddleware");


const { Offer } = require("../../models");
router.get("/", auth, async (req, res) => {
    const { offset, country } = req.query;
    const offers = await Offer.findAndCountAll({ where: { country: country }, offset: offset, limit: 10 });
    res.json(offers);
});
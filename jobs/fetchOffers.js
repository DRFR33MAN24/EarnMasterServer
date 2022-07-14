const { Offer } = require("../models");
const { Sequelize } = require("../database");
const config = require("config");
const axios = require("axios");

const fetch_cpalead = async () => {
  const apiKey = config.get("cpaleadAPIKey");
  const url = config.get("cpaleadURL");

  const response = await axios.get(`${url}?id=${apiKey}`);

  const cpaOffers = response.data.offers;
  const num_offers = response.data.number_offers;

  let offers = [];
  cpaOffers.map((offer) => {
    const image = offer.previews[0].url;

    offers.push({
      id: offer.campid,
      title: offer.title,
      description: offer.description,
      link: offer.link,
      amount: offer.amount,
      category: offer.category_name,
      image: image,
    });
  });

  const update = Offer.bulkCreate(offers);
};
const fetch_kiwi = async () => {};
module.exports = { fetch_cpalead, fetch_kiwi };

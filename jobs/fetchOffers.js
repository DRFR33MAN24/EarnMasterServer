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
    let image = "";
    let icon = "";
    if (offer.creatives.length !== 0) {
      icon = offer.creatives[0].url;
    }
    if (offer.previews.length !== 0) {
      image = offer.previews[0].url;
    }

    offers.push({
      id: offer.campid,
      title: offer.title,
      description: offer.description,
      link: offer.link,
      amount: offer.amount,
      category: offer.category_name,
      image: image,
      icon: icon,
    });
  });

  const update = Offer.bulkCreate(offers);
};
const fetch_kiwi = async () => {
  const apiKey = config.get("kiwiwallAPIKey");
  const url = config.get("kiwiwallURL");

  const response = await axios.get(`${url}/${apiKey}/?country=US`);

  const cpaOffers = response.data.offers;
  const num_offers = response.data.offers.length;

  let offers = [];
  cpaOffers.map((offer) => {
    let image = "";
    let icon = "";
    if (offer.logo) {
      icon = offer.logo;
    }
    if (offer.logo) {
      image = offer.logo;
    }

    offers.push({
      id: offer.id,
      title: offer.name,
      description: offer.instructions,
      link: offer.link,
      amount: offer.amount,
      category: offer.category,
      image: image,
      icon: icon,
    });
  });

  const update = Offer.bulkCreate(offers);
};
module.exports = { fetch_cpalead, fetch_kiwi };

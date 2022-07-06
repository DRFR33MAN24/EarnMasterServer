const { Offer } = require("../models");
const { Sequelize } = require("../database");
const config = require("config");
const axios = require("axios");

export const fetch_cpalead = async () => {
  const apiKey = config.get("cpaleadAPIKey");
  const url = config.get("cpaleadURL");

  const response = await axios.get(`${url}?id=${apiKey}`);
  const cpaOffers = response.offers;
  const num_offers = response.number_offers;

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

  const update = Offer.insertOrUpdate(offers);
};
export const fetch_kiwi = async () => { };

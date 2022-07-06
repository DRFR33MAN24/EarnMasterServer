const db = require("./../database");
const { DataTypes } = require("sequelize");

const Offer = db.define(
  "Offer",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // allowNull defaults to true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    os: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // allowNull defaults to true
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
  },

  {
    // Other model options go here
    charset: "utf8",
    collate: "utf8_unicode_ci",
  }
);

module.exports = Offer;

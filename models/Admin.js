const db = require("../database");
const { DataTypes } = require("sequelize");

const Admin = db.define(
  "Admin",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },

    profileImg: {
      type: DataTypes.STRING,
      allowNull: true,
      // allowNull defaults to true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      // allowNull defaults to true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,

      // allowNull defaults to true
    },

    register_date: {
      type: DataTypes.DATE,
      defaultValue: Date.now,
      // allowNull defaults to true
    },
  },
  {
    // Other model options go here
    charset: "utf8",
    collate: "utf8_unicode_ci",
  }
);

module.exports = Admin;

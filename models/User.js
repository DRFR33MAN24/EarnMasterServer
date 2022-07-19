const db = require("./../database");
const { DataTypes } = require("sequelize");
const { sendEmail } = require("../mail");
const { notify } = require("../notification");

const User = db.define(
  "User",
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
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      // allowNull defaults to true
    },
    notificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      // allowNull defaults to true
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    paypalMail: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      // allowNull defaults to true
    },
    cryptoWallet: {
      type: DataTypes.STRING,
      allowNull: true,
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
User.prototype.sendEmail = function (options, messageDetails) {
  options.to = this.email;
  sendEmail(options, messageDetails);
};
User.prototype.notify = function (messageDetails) {
  const options = { token: this.notificationToken };
  notify(options, messageDetails);
};

module.exports = User;

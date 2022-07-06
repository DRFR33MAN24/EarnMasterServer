const db = require("./../database");
const { DataTypes } = require("sequelize");

const PaymentOrder = db.define(
    "PaymentOrder",
    {
        // Model attributes are defined here
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,

        },

        date: {
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

module.exports = PaymentOrder;
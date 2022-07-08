const db = require("./../database");
const { DataTypes } = require("sequelize");

const Notification = db.define(
    "Notification",
    {
        // Model attributes are defined here
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,

        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },

    {
        // Other model options go here
        charset: "utf8",
        collate: "utf8_unicode_ci",
    }
);

module.exports = Notification;
const { Sequelize } = require("sequelize");

module.exports = new Sequelize("earnmaster", "drfr33man24", "blackmesa-123", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

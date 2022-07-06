const Admin = require("./Admin");
const User = require("./User");
const Offer = require("./Offer");

// Game.belongsToMany(Player, { through: "GamePlayers" });
// Player.belongsToMany(Game, { through: "GamePlayers" });

module.exports = { Admin, User, Offer };

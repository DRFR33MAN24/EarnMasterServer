const Admin = require("./Admin");
const User = require("./User");
const Offer = require("./Offer");
const PaymentOrder = require('./PaymentOrder');


Offer.belongsToMany(User, { through: "OfferUser" });
User.belongsToMany(Offer, { through: "OfferUser" });

User.hasMany(PaymentOrder);
PaymentOrder.belongsTo(User);


module.exports = { Admin, User, Offer, PaymentOrder };

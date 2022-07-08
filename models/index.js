const Admin = require("./Admin");
const User = require("./User");
const Notification = require('./Notification');
const Offer = require("./Offer");
const PaymentOrder = require('./PaymentOrder');


Offer.belongsToMany(User, { through: "OfferUser" });
User.belongsToMany(Offer, { through: "OfferUser" });

User.hasMany(PaymentOrder);
PaymentOrder.belongsTo(User);

Notification.belongsToMany(User, { through: "NotificationUser" });
User.belongsToMany(Notification, { through: "NotificationUser" });


module.exports = { Admin, User, Offer, PaymentOrder, Notification };

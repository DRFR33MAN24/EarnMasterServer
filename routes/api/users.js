const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const auth = require("../../middleware/auth");

// Player Model

const { User, PaymentOrder, Offer } = require("../../models");
const { parseQuery, saveProfileImage } = require("../../utility");
const db = require("../../database");
const { paypalPayment } = require("./payments");

router.post("/withdraw", auth, async (req, res) => {
  const { name, amount } = req.body;
  if (!name || !amount) {
    return res.json({ status: 400 });
  }
  const userId = req.user;
  // check if user have enough credit to submit the order
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ status: 400 });
    }
    if (user.balance < amount) {
      return res.status(400).json({ msg: "not enough credits!!" });
    }

    // create a payment order and decrease user balance
    const result = await db.transaction(async (t) => {
      user.increment({ balance: -amount });
      const payment = await PaymentOrder.create({
        name: name,
        amount: amount,
        status: "pending",
      });
      user.addPaymentOrder(payment);
    });
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
});

router.post("/buy", auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    return res.json({ status: 400 });
  }
  const userId = req.user;
  // check if user have enough credit to submit the order
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ status: 400 });
    }

    const paymentUrl = paypalPayment(amount, userId);
    if (!paymentUrl) {
      return res.json({ status: 400 });
    }
    res.json({ url: paymentUrl });
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
});

router.get("/offers", auth, async (req, res) => {
  const { offset } = req.query;
  const country = req.user.country;

  if (!offset) {
    return res.status(400);
  }
  try {
    const offers = await Offer.findAndCountAll({
      where: { country: country },
      limit: config.get("offers_fetch_limit"),
      offset: offset,
    });
    return res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});
router.get("/notifications", auth, async (req, res) => {
  const { offset } = req.query;
  const id = req.user.id;

  if (!offset) {
    return res.status(400);
  }
  try {
    const user = await User.findByPk(id);

    const notifications = await user.getNotifications({
      limit: config.get("notification_fetch_limit"),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

router.get("/activity", auth, async (req, res) => {
  const { offset } = req.query;
  const id = req.user.id;

  if (!offset) {
    return res.status(400);
  }
  try {
    const user = await User.findByPk(id);

    const activities = await user.getOffers({
      limit: config.get("activity_fetch_limit"),
      offset: offset,
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json(activities);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});
router.get("/transactions", auth, async (req, res) => {
  const { offset } = req.query;
  const id = req.user.id;

  if (!offset) {
    return res.status(400);
  }
  try {
    const user = await User.findByPk(id);

    const transactions = await user.getPaymentOrders({
      limit: config.get("payments_fetch_limit"),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

// router.get("/", auth, async (req, res) => {
//   if (!req.query) {
//     return res.json(JSON.stringify({ status: 400 }));
//   }
//   const parsedQuery = parseQuery(req.query);
//   // console.log(parsedQuery);
//   try {
//     let player = await Player.findAll({
//       where: parseQuery.filter,
//       order: parsedQuery.order,
//       offset: parseQuery.offset,
//       limit: parseQuery.limit,
//       raw: true,
//       //plain: true,
//     });

//     if (!player) {
//       return res.json(JSON.stringify({ status: 400 }));
//     }
//     if (player.active === false) {
//       return res
//         .status(400)
//         .json({ msg: "Please activate your account", status: "ERR" });
//     }

//     res.setHeader("X-Total-Count", player.length);
//     res.setHeader("Content-Type", "application/json");
//     res.end(JSON.stringify(player));
//   } catch (error) {
//     console.log(error);
//     return res.json(JSON.stringify({ status: 500 }));
//   }
// });

// router.get("/searchPlayers", auth, async (req, res) => {
//   console.log("seraching for player");
//   const { searchQuery } = req.query;
//   if (!searchQuery) {
//     return res.json([{ label: "NO Players ", id: 1 }]);
//   }
//   try {
//     const players = await Player.findAll({
//       where: {
//         name: { [Sequelize.Op.like]: `%${searchQuery}%` },
//       },
//       limit: 10,
//       raw: true,
//     });
//     // console.log(players);
//     if (!players) {
//       return res.json(JSON.stringify({ status: 400 }));
//     }
//     const result = players.map((player) => {
//       return {
//         label: player.name,
//         id: player.id,
//       };
//     });
//     // console.log(result);
//     return res.json(result);
//   } catch (error) {
//     console.log(error);
//     return res.json(JSON.stringify({ status: 500 }));
//   }
// });

// router.get("/:id", auth, async (req, res) => {
//   console.log("getting a record");
//   if (!req.params.id) {
//     return res.json(JSON.stringify({ status: 400 }));
//   }

//   try {
//     let player = await Player.findAll({
//       where: {
//         id: req.params.id,
//       },
//       plain: true,
//     });
//     //console.log("player", player);

//     if (!player) {
//       return res.status(404).json({ msg: "Not Found" });
//     }
//     if (player.active === false) {
//       return res
//         .status(400)
//         .json({ msg: "Please activate your account", status: "ERR" });
//     }

//     res.json(player);
//   } catch (error) {
//     console.log(error);
//     return res.json(JSON.stringify({ status: 500 }));
//   }

//   // User.findById(req.user.id)
//   //   .select("-password")
//   //   .then(user => res.json(user));
// });

// router.put("/:id", auth, async (req, res) => {
//   console.log("update route called");
//   const { password, repeat_password, active, name, email, pictures } = req.body;
//   if (!req.params.id) {
//     return res.json(JSON.stringify({ status: 400 }));
//   }

//   try {
//     let player = await Player.findOne({
//       where: { id: req.params.id },
//       raw: true,
//       plain: true,
//     });
//     //console.log(player);
//     let imageHash = "";
//     if (pictures) {
//       imageHash = saveProfileImage(pictures, player.profileImg);
//     } else {
//       imageHash = player.profileImg;
//     }

//     let salt = await bcryptjs.genSalt(10);
//     let hash = await bcryptjs.hash(password, salt);
//     await Player.update(
//       {
//         password: hash,
//         name: name,
//         active: active,
//         email: email,
//         profileImg: imageHash,
//       },
//       {
//         where: { id: req.params.id },
//       }
//     );
//     res.setHeader("Content-Type", "application/json");
//     res.end(JSON.stringify(req.body));
//   } catch (error) {
//     console.log(error);
//     return res.json(JSON.stringify({ status: 500 }));
//   }
// });

// router.post("/", auth, async (req, res) => {
//   console.log("create route called");
//   const { password, repeat_password, active, name, email, pictures } = req.body;
//   //Validate input here
//   if (!name || !password || !email) {
//     return res.json(JSON.stringify({ status: 400 }));
//   }

//   let imageHash = "";
//   if (pictures !== undefined) {
//     imageHash = saveProfileImage(pictures, "");
//   }
//   try {
//     let salt = await bcryptjs.genSalt(10);
//     let hash = await bcryptjs.hash(password, salt);
//     await Player.create({
//       password: hash,
//       name: name,
//       active: active,
//       email: email,
//       profileImg: imageHash,
//     });
//     res.setHeader("Content-Type", "application/json");
//     res.end(JSON.stringify(req.body));
//   } catch (error) {
//     console.log(error);
//     return res.json(JSON.stringify({ status: 500 }));
//   }
// });

module.exports = router;

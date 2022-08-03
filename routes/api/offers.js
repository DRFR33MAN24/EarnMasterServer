const express = require("express");
const router = express.Router();
const { Sequelize } = require("../../database");
const config = require("config");

//const axios = require("axios");

const auth = require("../../middleware/auth");
const { parseQuery } = require("../../utility");
const { Offer } = require("../../models");
router.get("/getOffers", auth, async (req, res) => {
  const { offset } = req.query;

  const offers = await Offer.findAndCountAll({
    limit: 10,
    offset: parseInt(offset),
  });
  res.json(offers);
});

router.get("/", auth, async (req, res) => {
  if (!req.query) {
    return res.json(JSON.stringify({ status: 400 }));
  }
  const parsedQuery = parseQuery(req.query);
  console.log(parsedQuery);
  try {
    let offer = await Offer.findAndCountAll({
      where: {
        ...parsedQuery.filter,
        title: parsedQuery.q
          ? { [Sequelize.Op.like]: "%" + parsedQuery.q + "%" }
          : { [Sequelize.Op.ne]: "" },
      },
      order: parsedQuery.order,
      offset: parsedQuery.offset,
      limit: parsedQuery.limit,
    });

    if (!offer) {
      return res.json(JSON.stringify({ status: 400 }));
    }

    res.setHeader("X-Total-Count", offer.count);
    res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(offer.rows));
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }
});

router.get("/searchOffers", auth, async (req, res) => {
  console.log("seraching for offer");
  const { searchQuery } = req.query;
  if (!searchQuery) {
    return res.json([{ label: "NO Offers ", id: 1 }]);
  }
  try {
    const offers = await Offer.findAll({
      where: {
        name: { [Sequelize.Op.like]: `%${searchQuery}%` },
      },
      limit: 10,
      raw: true,
    });
    // console.log(players);
    if (!offers) {
      return res.json(JSON.stringify({ status: 400 }));
    }
    const result = offers.map((offer) => {
      return {
        label: offer.name,
        id: offer.id,
      };
    });
    // console.log(result);
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }
});

router.get("/:id", auth, async (req, res) => {
  console.log("getting a record");
  if (!req.params.id) {
    return res.json(JSON.stringify({ status: 400 }));
  }

  try {
    let offer = await Offer.findAll({
      where: {
        id: req.params.id,
      },
      plain: true,
    });
    //console.log("player", player);

    if (!offer) {
      return res.status(404).json({ msg: "Not Found" });
    }

    res.json(offer);
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }

  // User.findById(req.user.id)
  //   .select("-password")
  //   .then(user => res.json(user));
});

router.put("/:id", auth, async (req, res) => {
  console.log("update route called");
  const { password, repeat_password, active, name, email, pictures } = req.body;
  if (!req.params.id) {
    return res.json(JSON.stringify({ status: 400 }));
  }

  try {
    let user = await User.findOne({
      where: { id: req.params.id },
      raw: true,
      plain: true,
    });
    //console.log(player);
    let imageHash = "";
    if (pictures) {
      imageHash = saveProfileImage(pictures, user.profileImg);
    } else {
      imageHash = user.profileImg;
    }

    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(password, salt);
    await User.update(
      {
        password: hash,
        name: name,
        active: active,
        email: email,
        profileImg: imageHash,
      },
      {
        where: { id: req.params.id },
      }
    );
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(req.body));
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }
});

router.post("/", auth, async (req, res) => {
  console.log("create route called");
  const { password, repeat_password, active, name, email, pictures } = req.body;
  //Validate input here
  if (!name || !password || !email) {
    return res.json(JSON.stringify({ status: 400 }));
  }

  let imageHash = "";
  if (pictures !== undefined) {
    imageHash = saveProfileImage(pictures, "");
  }
  try {
    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(password, salt);
    await User.create({
      password: hash,
      name: name,
      active: active,
      email: email,
      profileImg: imageHash,
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(req.body));
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }
});
module.exports = router;

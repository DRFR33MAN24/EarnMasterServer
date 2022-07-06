const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const auth = require("../../middleware/auth");

// Player Model

const { Player } = require("../../models");
const { parseQuery, saveProfileImage } = require("../../utility");
const { Sequelize } = require("../../database");

// @route POST api/users
// @desc Register New User
// @acces Public
router.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password, active } = req.body;
  // Verify URL
  // const query = stringify({
  //   secret: config.get("reCAPTCHA"),
  //   response: req.body.token,
  //   remoteip: req.connection.remoteAddress
  // });
  // const verifyURL = `${config.get("verifyURL")}${query}`;
  // //console.log(verifyURL);
  // const body = await axios.get(verifyURL);
  //console.log(body.data);
  // if (body.data.success !== undefined && !body.data.success) {
  //   return res.status(400).json({ msg: "Failed captcha verification" });
  // }

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Check for exitsting user
  let player = await Player.findOne(
    { where: { email: `${email}` } },
    { plain: true }
  );
  if (player) {
    return res.status(400).json({ msg: "User alerady exists." });
  }

  // const newUser = new User({
  //   name,
  //   email,
  //   password
  // });
  const newPlayer = Player.build({
    name: `${name}`,
    phone: `${email}`,
    password: `${password}`,
    active: `${active}`,
  });

  // Create salt and hash

  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(newPlayer.password, salt, (err, hash) => {
      if (err) throw err;
      newPlayer.password = hash;
      newPlayer.save().then((player) => {
        jwt.sign(
          { id: player.id },
          config.get("jwtSecret"),
          {
            expiresIn: 604800,
          },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              player: {
                id: player.id,
                name: player.name,
                phone: player.phone,
                active: player.active,
              },
            });
          }
        );
      });
    });
  });
});

router.get("/", auth, async (req, res) => {
  if (!req.query) {
    return res.json(JSON.stringify({ status: 400 }));
  }
  const parsedQuery = parseQuery(req.query);
  // console.log(parsedQuery);
  try {
    let player = await Player.findAll({
      where: parseQuery.filter,
      order: parsedQuery.order,
      offset: parseQuery.offset,
      limit: parseQuery.limit,
      raw: true,
      //plain: true,
    });

    if (!player) {
      return res.json(JSON.stringify({ status: 400 }));
    }
    if (player.active === false) {
      return res
        .status(400)
        .json({ msg: "Please activate your account", status: "ERR" });
    }

    res.setHeader("X-Total-Count", player.length);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(player));
  } catch (error) {
    console.log(error);
    return res.json(JSON.stringify({ status: 500 }));
  }
});

router.get("/searchPlayers", auth, async (req, res) => {
  console.log("seraching for player");
  const { searchQuery } = req.query;
  if (!searchQuery) {
    return res.json([{ label: "NO Players ", id: 1 }]);
  }
  try {
    const players = await Player.findAll({
      where: {
        name: { [Sequelize.Op.like]: `%${searchQuery}%` },
      },
      limit: 10,
      raw: true,
    });
    // console.log(players);
    if (!players) {
      return res.json(JSON.stringify({ status: 400 }));
    }
    const result = players.map((player) => {
      return {
        label: player.name,
        id: player.id,
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
    let player = await Player.findAll({
      where: {
        id: req.params.id,
      },
      plain: true,
    });
    //console.log("player", player);

    if (!player) {
      return res.status(404).json({ msg: "Not Found" });
    }
    if (player.active === false) {
      return res
        .status(400)
        .json({ msg: "Please activate your account", status: "ERR" });
    }

    res.json(player);
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
    let player = await Player.findOne({
      where: { id: req.params.id },
      raw: true,
      plain: true,
    });
    //console.log(player);
    let imageHash = "";
    if (pictures) {
      imageHash = saveProfileImage(pictures, player.profileImg);
    } else {
      imageHash = player.profileImg;
    }

    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(password, salt);
    await Player.update(
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
    await Player.create({
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

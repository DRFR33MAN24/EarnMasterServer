const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

//const axios = require("axios");

const auth = require("../../middleware/auth");
// User Model
const User = require("../../models");
const { parseQuery } = require("../../utility");

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
  let user = await User.findOne(
    { where: { email: `${email}` } },
    { plain: true }
  );
  if (user) {
    return res.status(400).json({ msg: "User alerady exists." });
  }

  // const newUser = new User({
  //   name,
  //   email,
  //   password
  // });
  const newUser = User.build({
    name: `${name}`,
    phone: `${email}`,
    password: `${password}`,
    active: `${active}`,
  });

  // Create salt and hash

  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then((user) => {
        jwt.sign(
          { id: user.id },
          config.get("jwtSecret"),
          {
            expiresIn: 604800,
          },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              user: {
                id: user.id,
                name: user.name,
                phone: user.email,
                active: user.active,
              },
            });
          }
        );
      });
    });
  });
});

router.get("/", auth, async (req, res) => {
  //console.log("Get Users Route", req.query);
  const parsedQuery = parseQuery(req.query);
  // console.log(parsedQuery);
  let user = await User.findAll({
    where: parseQuery.filter,
    order: parsedQuery.order,
    offset: parseQuery.offset,
    limit: parseQuery.limit,
    raw: true,
    //plain: true,
  });

  if (user.active === false) {
    return res
      .status(400)
      .json({ msg: "Please activate your account", status: "ERR" });
  }
  //console.log(user);
  res.setHeader("X-Total-Count", user.length);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(user));

  // User.findById(req.user.id)
  //   .select("-password")
  //   .then(user => res.json(user));
});

router.get("/:id", auth, async (req, res) => {
  //console.log("LoadUser Route");
  let user = await User.findAll({
    where: {
      id: req.params.id,
    },
    plain: true,
  });

  if (user.active === false) {
    return res
      .status(400)
      .json({ msg: "Please activate your account", status: "ERR" });
  }

  res.json(user);

  // User.findById(req.user.id)
  //   .select("-password")
  //   .then(user => res.json(user));
});

module.exports = router;

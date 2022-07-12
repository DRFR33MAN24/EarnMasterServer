const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const multer = require("multer");

//const axios = require("axios");

// User Model
const { User } = require("../../models");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const userFolder = "./users_data";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const profilePath = `${userFolder}/${req.user.id}`;

    cb(null, profilePath);
  },
  filename: function (req, file, cb) {
    const profilePath = `${userFolder}/${req.user.id}`;
    const draft = "draft";

    let files = glob.sync(profilePath + "/draft.*");

    files.map((f) => {
      fs.unlinkSync(f, (err) => {
        if (err) {
          console.log("failed to delete local image" + err);
        } else {
          console.log("successfully deleted local image");
        }
      });
    });

    cb(null, draft + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// @route POST api/auth
// @desc Auth the user
// @acces Public
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

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

  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: "Please enter all fields", status: "ERR" });
  }

  let user = await User.findOne({ where: { email: email } }, { plain: true });
  if (!user) {
    return res
      .status(400)
      .json({ msg: "User Does not exists.", status: "ERR" });
  }
  if (user.active === false) {
    return res
      .status(400)
      .json({ msg: "Please activate your account", status: "ERR" });
  }

  // Validate password
  bcryptjs.compare(password, user.password).then((isMatch) => {
    if (!isMatch)
      return res
        .status(400)
        .json({ msg: "Invalid credentials", status: "ERR" });
    jwt.sign(
      { id: user.id, isManager: user.isManager, email: user.email },
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

            email: user.email,

            password: user.password,
          },
        });
      }
    );
  });
});

router.get("/img", auth, async (req, res) => {
  //console.log('Image Route Called');
  //console.log(req.headers);
  const profile = glob.sync(
    path.join(__dirname, "../..", userFolder, req.user.phone, "profile.*")
  );
  //console.log(profile[0]);
  fs.access(profile[0], (error) => {
    //  if any error
    if (error) {
      console.log(error);
      return;
    }
  });

  //res.contentType("png");
  res.sendFile(profile[0]);
});

router.post("/idUpload", [auth, upload.single("file")], async (req, res) => {
  res.end("200");
});

module.exports = router;

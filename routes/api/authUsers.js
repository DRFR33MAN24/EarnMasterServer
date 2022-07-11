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

const { body, checkSchema, validationResult } = require("express-validator");
const { default: axios } = require("axios");
const registrationSchema = {
  username: {
    custom: {
      options: (value) => {
        return User.find({
          username: value,
        }).then((user) => {
          if (user.length > 0) {
            return Promise.reject("Username already in use");
          }
        });
      },
    },
  },
  gender: {
    notEmpty: true,
    errorMessage: "Gender field cannot be empty",
  },
  password: {
    isStrongPassword: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    errorMessage:
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
  },
  phone: {
    notEmpty: true,
    errorMessage: "Phone number cannot be empty",
  },
  email: {
    normalizeEmail: true,
    custom: {
      options: (value) => {
        return User.find({
          email: value,
        }).then((user) => {
          if (user.length > 0) {
            return Promise.reject("Email address already taken");
          }
        });
      },
    },
  },
};
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
router.post("/", checkSchema(registrationSchema), async (req, res) => {
  const { email, password, deviceToken } = req.body;

  console.log(req.body);

  // Validate incoming input
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

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
  try {

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

    await user.update({ deviceToken: deviceToken });

    // Validate password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ msg: "Invalid credentials", status: "ERR" });
    const token = jwt.sign(
      { id: user.id, email: user.email, country: user.country },
      config.get("jwtSecret"),
      {
        expiresIn: 604800,
      });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,

        email: user.email,

        password: user.password,
      },
    });

  } catch (error) {

  }
});

router.post('/googleSignIn', async (req, res) => {
  const { tokenId, deviceToken } = req.body;

  if (!tokenId) {
    return res.status(400).json({ msg: "Bad token" });
  }
  try {
    const userInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`);
    // Check for exitsting user
    let user = await User.findOne(
      { where: { email: `${userInfo.email}` } },
      { plain: true }
    );
    if (user) {
      const token = jwt.sign({ id: user.id, email: user.email, country: user.country }, config.get("jwtSecret"),
        {
          expiresIn: 604800,
        });

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          active: user.active,
        },
      });
    }

    const newUser = User.build({
      name: `${userInfo.name}`,
      email: `${userInfo.email}`,
      country: userInfo.country,
      active: `${true}`,
      notificationToken: deviceToken,


    });


    const user = await newUser.save();
    const token = jwt.sign({ id: user.id, email: user.email, country: user.country }, config.get("jwtSecret"),
      {
        expiresIn: 604800,
      });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        active: user.active,
      },
    });


  } catch (error) {

  }
})

// @route POST api/users
// @desc Register New User
// @acces Public
router.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password, active, deviceToken } = req.body;
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
  try {
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
      email: `${email}`,
      password: `${password}`,
      active: `${active}`,
      notificationToken: deviceToken,
      country: country,

    });

    // Create salt and hash
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(newUser.password, salt);
    newUser.password = hash;
    const user = await newUser.save();
    const token = jwt.sign({ id: user.id, email: user.email, country: user.country }, config.get("jwtSecret"),
      {
        expiresIn: 604800,
      });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        active: user.active,
      },
    });


  } catch (error) {

  }
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

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
  repeat_password: {
    isStrongPassword: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    errorMessage:
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
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

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

// @route POST api/auth
// @desc Auth the user
// @acces Public
router.post("/login", async (req, res) => {
  const { email, password, deviceToken } = req.body;

  //console.log(req.body);

  // Validate incoming input
  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   return res.status(400).json({
  //     errors: errors.array(),
  //   });
  // }

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
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  try {
    let user = await User.findOne({ where: { email: email } }, { plain: true });
    if (!user) {
      return res.status(400).json({ msg: "User Does not exists." });
    }
    if (user.active === false) {
      return res.status(400).json({ msg: "Please activate your account" });
    }

    await user.update({ notificationToken: deviceToken });

    // Validate password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, email: user.email, country: user.country },
      config.get("jwtSecret"),
      {
        expiresIn: 604800,
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,

        email: user.email,

        password: user.password,
        balance: user.balance,
        country: user.country,
        dob: user.dateOfBirth,
      },
    });
  } catch (error) {}
});
router.post("/loadUser", auth, async (req, res) => {
  const userId = req.user.id;
  const { deviceToken } = req.body;
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.json({ status: 400 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, country: user.country },
      config.get("jwtSecret"),
      {
        expiresIn: 604800,
      }
    );
    user.update({ notificationToken: deviceToken });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,

        email: user.email,

        password: user.password,
        balance: user.balance,
        dob: user.dateOfBirth,
        country: user.country,
      },
    });
  } catch (error) {}
});

router.post("/loginGoogle", async (req, res) => {
  const { tokenId, deviceToken } = req.body;

  if (!tokenId) {
    return res.status(400).json({ msg: "Bad token" });
  }
  try {
    const userInfo = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`
    );
    // Check for exitsting user
    let user = await User.findOne(
      { where: { email: `${userInfo.email}` } },
      { plain: true }
    );
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email, country: user.country },
        config.get("jwtSecret"),
        {
          expiresIn: 604800,
        }
      );

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

    let newUser = User.build({
      name: `${userInfo.name}`,
      email: `${userInfo.email}`,
      country: userInfo.country,
      active: `${true}`,
      notificationToken: deviceToken,
    });

    newUser = await newUser.save();
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, country: newUser.country },
      config.get("jwtSecret"),
      {
        expiresIn: 604800,
      }
    );

    return res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        active: newUser.active,
        balance: newUser.balance,
      },
    });
  } catch (error) {}
});

// @route POST api/users
// @desc Register New User
// @acces Public
router.post("/register", async (req, res) => {
  console.log(req.body);
  const {
    username,
    email,
    password,
    repeat_password,
    deviceToken,
    country,
    dob,
  } = req.body;
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

  if (
    !username ||
    !email ||
    !password ||
    !repeat_password ||
    !dob ||
    !country ||
    !deviceToken
  ) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  if (password !== repeat_password) {
    return res.status(400).json({ msg: "Passwords dont match" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ msg: "Not a valid email address" });
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
    let newUser = User.build({
      name: username,
      email: `${email}`,
      password: `${password}`,
      active: false,
      notificationToken: deviceToken,
      country: country,
      dateOfBirth: dob,
    });

    // Create salt and hash
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(newUser.password, salt);
    newUser.password = hash;
    newUser = await newUser.save();
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, country: newUser.country },
      config.get("jwtSecret"),
      {
        expiresIn: 604800,
      }
    );

    return res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        active: newUser.active,
        balance: newUser.balance,
        country: newUser.country,
        dob: newUser.dataOfBirth,
      },
    });
  } catch (error) {
    console.log(error);
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
router.post("/testInstanceMethod", async (req, res) => {
  try {
    const user = await User.findByPk(1);
    user.sendEmail(
      { provider: "mailgun" },
      { title: "test msg", body: "hello it's a test message" }
    );
    res.end("success");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

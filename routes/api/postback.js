const express = require("express");
const router = express.Router();

const config = require("config");

router.post("/cpalead", async (req, res) => {
  console.log(req.body);
});
router.post("/kiwiwall", async (req, res) => {
  console.log(req.body);
});

module.exports = router;

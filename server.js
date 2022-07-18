const express = require("express");
const cors = require("cors");
//const config = require("config");
const path = require("path");
const db = require("./database");
const cron = require("node-cron");
const { fetch_cpalead, fetch_kiwi } = require("./jobs/fetchOffers");

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

db.authenticate()
  .then(() => {
    console.log("Authenticated");
    db.sync({ force: false });
    //db.close();
  })
  .catch((err) => {
    console.log("Unable to connect", err);
  });

app.use("/api/postback", require("./routes/api/postback"));

app.use("/api/admins", require("./routes/api/admins"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/offers", require("./routes/api/offers"));

app.use("/api/payments", require("./routes/api/payments").router);

app.use("/api/authUser", require("./routes/api/authUsers"));
app.use("/api/authAdmin", require("./routes/api/authAdmins"));

app.use(express.static("public"));
app.use(express.static("app"));

/* GET React App */
app.get(["/app", "/app/*"], function (req, res, next) {
  res.sendFile(path.join(__dirname, "app", "index.html"));
  //console.log("check");
});

// (async function () {
//   await fetch_kiwi();
// })();

// cron.schedule("* * * * *", fetch_cpalead);
// cron.schedule("* * * * *", fetch_kiwi);

const port = process.env.PORT || 5000;

app.listen(port);
process.on("SIGINT", () => {
  console.log(" Closing DB connection and server");
  db.close();
  server.close();
});

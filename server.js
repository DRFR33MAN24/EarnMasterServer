const express = require("express");
const cors = require("cors");
//const config = require("config");
const path = require("path");
const db = require("./database");

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

app.use("/api/authUser", require("./routes/api/authUser"));
app.use("/api/authAdmin", require("./routes/api/authAdmin"));

app.use(express.static("public"));
app.use(express.static("app"));

/* GET React App */
app.get(["/app", "/app/*"], function (req, res, next) {
  res.sendFile(path.join(__dirname, "app", "index.html"));
  //console.log("check");
});

const port = process.env.PORT || 5000;

app.listen(port);
process.on("SIGINT", () => {
  console.log(" Closing DB connection and server");
  db.close();
  server.close();
});

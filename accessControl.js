const AccessControl = require("accesscontrol");

const ac = new AccessControl();
// ac.grant("player") // define new or modify existing role. also takes an array.
//   .createOwn("video") // equivalent to .createOwn('video', ['*'])
//   .deleteOwn("video")
//   .readAny("video")
//   .grant("admin") // switch to another role without breaking the chain
//   .extend("user") // inherit role capabilities. also takes an array
//   .updateAny("video", ["title"]) // explicitly defined attributes
//   .deleteAny("video");

module.exports = { ac };

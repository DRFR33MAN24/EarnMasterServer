const mapValues = require("lodash/mapValues");
const fs = require("fs");
const { uuid } = require("uuidv4");

const getFilter = (filter, filtersOption) =>
  mapValues(filter, (value, key) => {
    if (filtersOption && filtersOption[key]) {
      return filtersOption[key](value);
    }
    return value;
  });
const parseQuery = (query, filtersOption) => {
  const { range, sort, filter } = query;

  const [from, to] = range ? JSON.parse(range) : [0, 100];

  const { q, ...filters } = JSON.parse(filter || "{}");

  return {
    offset: from,
    limit: to - from + 1,
    filter: getFilter(filters, filtersOption),
    order: [sort ? JSON.parse(sort) : ["id", "ASC"]],
    q,
  };
};

const saveProfileImage = (pictures, oldImage) => {
  let imageHash = uuid();

  var data = pictures[0].src.split(";base64,").pop();
  var buf = Buffer.from(data, "base64");

  fs.writeFile(__dirname + "/public/" + imageHash, buf, function (err) {
    console.log("Image created");
    if (oldImage !== "") {
      fs.unlink(__dirname + "/public/" + oldImage, (err) => {
        if (err) {
          console.log(err);
          return;
        } //handle your error the way you want to;
        console.log("Image was deleted"); //or else the file will be deleted
      });
    }
  });
  return imageHash;
};
module.exports = { getFilter, parseQuery, saveProfileImage };

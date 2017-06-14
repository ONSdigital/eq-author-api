const { find } = require("lodash");
const fixtures = require("../fixtures/data.json");

function findFixture(type, id) {
  return find(fixtures, {
    model: type,
    data : { id }
  }).data;
}
module.exports = findFixture;
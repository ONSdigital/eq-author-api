const { mapKeys, get, curry } = require("lodash");

module.exports = curry(function mapFields(mapping, obj) {
  return mapKeys(obj, (val, key) => get(mapping, key, key));
});
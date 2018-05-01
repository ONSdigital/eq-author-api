const { mapKeys, get, curry, isNil } = require("lodash");

module.exports = curry(function mapFields(mapping, obj) {
  if (isNil(obj)) {
    return obj;
  }

  return mapKeys(obj, (val, key) => get(mapping, key, key));
});

const { endsWith } = require("lodash/fp");

module.exports = id => {
  if (endsWith("from", id)) {
    return "primary";
  } else if (endsWith("to", id)) {
    return "secondary";
  } else {
    return null;
  }
};

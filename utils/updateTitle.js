const { replace, isEmpty, isNil } = require("lodash");

const fn = group => (isNil(group) ? "" : group);

module.exports = (title, prefix = "Copy of ") => {
  if (isNil(title) || isEmpty(title)) {
    return "";
  }

  return replace(title, /(<\w+>)?([^<]*)(<\/\w+>)?/, (_, a, b, c) => {
    return isEmpty(b)
      ? `${fn(a)}${b}${fn(c)}`
      : `${fn(a)}${prefix}${b}${fn(c)}`;
  });
};

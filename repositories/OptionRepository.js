const { head, invert, map } = require("lodash/fp");
const Option = require("../db/Option");
const mapFields = require("../utils/mapFields");
const mapping = { AnswerId: "answerId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Option.findAll()
    .where({ isDeleted: false })
    .where(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return Option.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = function insert({
  label,
  description,
  value,
  qCode,
  childAnswerId,
  answerId
}) {
  return Option.create(
    toDb({
      label,
      description,
      value,
      qCode,
      childAnswerId,
      answerId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.update = function update({
  id,
  label,
  description,
  value,
  qCode,
  childAnswerId,
  isDeleted
}) {
  return Option.update(id, {
    label,
    description,
    value,
    qCode,
    childAnswerId,
    isDeleted
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Option.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return Option.update(id, { isDeleted: false }).then(head);
};

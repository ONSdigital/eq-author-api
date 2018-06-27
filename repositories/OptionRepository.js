const { head, invert, map } = require("lodash/fp");
const Option = require("../db/Option");
const mapFields = require("../utils/mapFields");
const db = require("../db");
const { handleOptionDeleted } = require("./strategies/routingStrategy");
const mapping = { AnswerId: "answerId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Option.findAll()
    .where({ isDeleted: false, otherAnswerId: null })
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
  answerId
}) {
  return Option.create(
    toDb({
      label,
      description,
      value,
      qCode,
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
  isDeleted
}) {
  return Option.update(id, {
    label,
    description,
    value,
    qCode,
    isDeleted
  })
    .then(head)
    .then(fromDb);
};

const deleteOption = async (trx, id) => {
  const deletedOption = await trx("Options")
    .where({
      id: parseInt(id)
    })
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head)
    .then(fromDb);

  await handleOptionDeleted(trx, id);

  return deletedOption;
};

module.exports.remove = function remove(id) {
  return db.transaction(trx => deleteOption(trx, id));
};

module.exports.undelete = function(id) {
  return Option.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.getOtherOption = function(
  answerId,
  orderBy = "created_at",
  direction = "asc"
) {
  return Option.findAll()
    .where({ isDeleted: false, otherAnswerId: answerId })
    .orderBy(orderBy, direction)
    .first();
};

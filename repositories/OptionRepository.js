const { head, invert, map, isEmpty } = require("lodash/fp");
const Option = require("../db/Option");
const mapFields = require("../utils/mapFields");
const db = require("../db");
const { handleOptionDeleted } = require("./strategies/routingStrategy");
const mapping = { AnswerId: "answerId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

const checkForExistingExclusive = async answerId => {
  const existingExclusive = await Option.findAll().where(
    toDb({
      answerId,
      mutuallyExclusive: true,
      isDeleted: false
    })
  );
  if (!isEmpty(existingExclusive)) {
    throw new Error("There is already an exclusive checkbox on this answer.");
  }
};

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

module.exports.findExclusiveOptionByAnswerId = function findExclusiveOptionByAnswerId(
  answerId
) {
  return Option.findAll()
    .where(
      toDb({
        isDeleted: false,
        otherAnswerId: null,
        mutuallyExclusive: true,
        answerId
      })
    )
    .then(fromDb)
    .then(head);
};

module.exports.getById = function getById(id) {
  return Option.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = async function insert(
  { label, description, value, qCode, answerId, mutuallyExclusive = false },
  trx = db
) {
  if (mutuallyExclusive) {
    await checkForExistingExclusive(answerId);
  }
  return trx("Options")
    .insert(
      toDb({
        label,
        description,
        value,
        qCode,
        answerId,
        mutuallyExclusive
      })
    )
    .returning("*")
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

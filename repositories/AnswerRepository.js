const { head, invert, map } = require("lodash/fp");
const Answer = require("../db/Answer");
const mapFields = require("../utils/mapFields");
const mapping = { QuestionPageId: "questionPageId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));
const db = require("../db");
const {
  createOtherAnswer,
  deleteOtherAnswer
} = require("./strategies/multipleChoiceOtherAnswerStrategy");

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Answer.findAll()
    .where({ isDeleted: false, parentAnswerId: null })
    .where(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return Answer.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = function insert({
  description,
  guidance,
  label,
  secondaryLabel,
  qCode,
  type,
  mandatory,
  questionPageId
}) {
  return Answer.create(
    toDb({
      description,
      guidance,
      label,
      secondaryLabel,
      qCode,
      type,
      mandatory,
      questionPageId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.update = function update({
  id,
  description,
  guidance,
  label,
  secondaryLabel,
  qCode,
  type,
  mandatory,
  isDeleted,
  parentAnswerId
}) {
  return Answer.update(id, {
    description,
    guidance,
    label,
    secondaryLabel,
    qCode,
    type,
    mandatory,
    isDeleted,
    parentAnswerId
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Answer.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return Answer.update(id, { isDeleted: false }).then(head);
};

module.exports.getOtherAnswer = function(
  id,
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Answer.findAll()
    .where({ isDeleted: false, parentAnswerId: id })
    .where(where)
    .orderBy(orderBy, direction)
    .first();
};

module.exports.createOtherAnswer = ({ id }) => {
  return db.transaction(trx => createOtherAnswer(trx, { id }));
};

module.exports.deleteOtherAnswer = ({ id }) => {
  return db.transaction(trx => deleteOtherAnswer(trx, { id }));
};

const { head, invert, map } = require("lodash/fp");
const Answer = require("../db/Answer");
const mapFields = require("../utils/mapFields");
const mapping = { QuestionPageId: "questionPageId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Answer.findAll()
    .where({ isDeleted: false })
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
  qCode,
  type,
  mandatory,
  hasOtherOption,
  questionPageId
}) {
  return Answer.create(
    toDb({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory,
      hasOtherOption,
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
  qCode,
  type,
  mandatory,
  isDeleted,
  hasOtherOption
}) {
  return Answer.update(id, {
    description,
    guidance,
    label,
    qCode,
    type,
    mandatory,
    isDeleted,
    hasOtherOption
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

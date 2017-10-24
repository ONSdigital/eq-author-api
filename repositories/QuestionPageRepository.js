const { head, invert, map } = require("lodash/fp");
const QuestionPage = require("../db/QuestionPage");
const mapFields = require("../utils/mapFields");
const mapping = { SectionId: "sectionId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return QuestionPage.findAll()
    .where({ isDeleted: false })
    .where(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return QuestionPage.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = function insert({
  title,
  description,
  guidance,
  sectionId
}) {
  return QuestionPage.create(
    toDb({
      title,
      description,
      guidance,
      sectionId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.update = function update({
  id,
  title,
  description,
  guidance,
  isDeleted
}) {
  return QuestionPage.update(id, {
    title,
    description,
    guidance,
    isDeleted
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return QuestionPage.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return QuestionPage.update(id, { isDeleted: false }).then(head);
};

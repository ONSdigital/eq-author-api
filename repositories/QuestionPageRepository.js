const { head, invert, map } = require("lodash/fp");
const QuestionPage = require("../db/QuestionPage");
const mapFields = require("../utils/mapFields");

const mapping = { SectionId: "sectionId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where,
  orderBy = "created_at",
  direction = "asc"
) {
  return QuestionPage.findAll(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return QuestionPage.findById(id).then(fromDb);
};

module.exports.insert = function insert({
  title,
  description,
  guidance,
  type,
  sectionId
}) {
  return QuestionPage.create(
    toDb({
      title,
      description,
      guidance,
      type,
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
  type
}) {
  return QuestionPage.update(id, {
    title,
    description,
    guidance,
    type
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return QuestionPage.destroy(id).then(head).then(fromDb);
};

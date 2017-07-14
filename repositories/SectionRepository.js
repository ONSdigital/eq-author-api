const { head, invert, map } = require("lodash/fp");
const Section = require("../db/Section");
const mapFields = require("../utils/mapFields");

const mapping = { QuestionnaireId: "questionnaireId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where,
  orderBy = "created_at",
  direction = "asc"
) {
  return Section.findAll(where).orderBy(orderBy, direction).then(map(fromDb));
};

module.exports.get = function get(id) {
  return Section.findById(id).then(fromDb);
};

module.exports.insert = function insert({
  title,
  description,
  questionnaireId
}) {
  return Section.create(
    toDb({
      title,
      description,
      questionnaireId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.update = function update({ id, title, description }) {
  return Section.update(id, {
    title,
    description
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Section.destroy(id).then(head).then(fromDb);
};
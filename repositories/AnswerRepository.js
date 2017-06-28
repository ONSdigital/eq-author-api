const { head, invert, map } = require("lodash/fp");
const Answer = require("../db/Answer");
const mapFields = require("../utils/mapFields");

const mapping = { QuestionPageId : "questionPageId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Answer
    .findAll(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return Answer.findById(id).then(head)
};

module.exports.insert = function insert({ description, guidance, label, qCode, type, mandatory, questionPageId }) {
  return Answer
    .create(toDb({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory,
      questionPageId
    }))
    .then(head)
    .then(fromDb);
}

module.exports.update = function update({ id, description, guidance, label, qCode, type, mandatory }) {
  return Answer
    .update(id, {
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory
    })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Answer
    .destroy(id)
    .then(head)
    .then(fromDb);
};
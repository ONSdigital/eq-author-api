const { head } = require("lodash");
const Answer = require("../models/Answer");

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Answer.findAll(where).orderBy(orderBy, direction);
};

module.exports.get = function get(id) {
  return Answer.findById(id);
};

module.exports.insert = function insert({ description, guidance, label, qCode, type, mandatory, QuestionId }) {
  return Answer
    .create({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory,
      QuestionId
    })
    .then(head);
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
    .then(head);
};

module.exports.remove = function remove(id) {
  return Answer
    .destroy(id)
    .then(head);
};
const { head } = require("lodash");
const Answer = require("../models/Answer");

module.exports.findAll = function findAll(where) {
  return Answer.findAll(where);
};

module.exports.get = function get(id) {
  return Answer.findById(id);
};

module.exports.insert = function insert({ description, guidance, label, qCode, type, mandatory, questionId }) {
  return Answer
    .create({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory,
      QuestionId : questionId
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
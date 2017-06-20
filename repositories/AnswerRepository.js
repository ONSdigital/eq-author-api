const { Answer } = require("../models");

module.exports.findAll = function findAll(where) {
  return Answer.findAll({ where });
};

module.exports.get = function get(id) {
  return Answer.findById(id);
};

module.exports.insert = function insert({ description, guidance, label, qCode, type, mandatory, questionId }) {
  return Answer.create({
    description,
    guidance,
    label,
    qCode,
    type,
    mandatory,
    QuestionId : questionId
  });
}

module.exports.update = function update({ id, description, guidance, label, qCode, type, mandatory }) {
  return Answer
    .findById(id)
    .then(answer => answer.update({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory
    }));
};

module.exports.remove = function remove(id) {
  return Answer
    .findById(id)
    .then(answer => answer.destroy().then(() => answer));
};
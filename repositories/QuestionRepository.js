const { Question } = require("../models");

module.exports.findAll = function findAll(where) {
  return Question.findAll({ where });
};

module.exports.get = function get(id) {
  return Question.findById(id);
};

module.exports.insert = function insert({ title, description, guidance, type, mandatory, pageId }) {
  return Question.create({
    title,
    description,
    guidance,
    type,
    mandatory,
    PageId : pageId
  });
}

module.exports.update = function update({ id, title, description, guidance, type, mandatory }) {
  return Question
    .findById(id)
    .then(question => question.update({
      title,
      description,
      guidance,
      type,
      mandatory
    }));
};

module.exports.remove = function remove(id) {
  return Question
    .findById(id)
    .then(question => question.destroy().then(() => question));
};
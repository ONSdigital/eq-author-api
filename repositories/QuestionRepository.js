const { head } = require("lodash");
const Question = require("../models/Question");

module.exports.findAll = function findAll(where) {
  return Question.findAll(where);
};

module.exports.get = function get(id) {
  return Question.findById(id);
};

module.exports.insert = function insert({ title, description, guidance, type, mandatory, GroupId }) {
  return Question
    .create({
      title,
      description,
      guidance,
      type,
      mandatory,
      GroupId
    })
    .then(head);
}

module.exports.update = function update({ id, title, description, guidance, type, mandatory }) {
  return Question
    .update(id, {
      title,
      description,
      guidance,
      type,
      mandatory
    })
    .then(head);
};

module.exports.remove = function remove(id) {
  return Question
    .destroy(id)
    .then(head);
};
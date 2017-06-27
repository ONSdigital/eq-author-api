const { head } = require("lodash");
const QuestionPage = require("../db/QuestionPage");

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return QuestionPage.findAll(where).orderBy(orderBy, direction);
};

module.exports.get = function get(id) {
  return QuestionPage.findById(id);
};

module.exports.insert = function insert({ title, description, guidance, type, mandatory, GroupId }) {
  return QuestionPage
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
  return QuestionPage
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
  return QuestionPage
    .destroy(id)
    .then(head);
};
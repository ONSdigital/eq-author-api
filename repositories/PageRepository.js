const { head } = require("lodash");
const Page = require("../models/Page");

module.exports.findAll = function findAll(where) {
  return Page.findAll(where);
};

module.exports.get = function get(id) {
  return Page.findById(id);
};

module.exports.insert = function insert({ title, description, questionnaireId }) { 
  return Page
    .create({
      title,
      description,
      QuestionnaireId : questionnaireId
    })
    .then(head);
}

module.exports.update = function update({ id, title, description }) {
  return Page
    .update(id, { title, description })
    .then(head);
};

module.exports.remove = function remove(id) {
  return Page
    .destroy(id)
    .then(head);
};
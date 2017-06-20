const { Page } = require("../models");

module.exports.findAll = function findAll(where) {
  return Page.findAll({ where });
};

module.exports.get = function get(id) {
  return Page.findById(id);
};

module.exports.insert = function insert({ title, description, questionnaireId }) { 
  return Page.create({
    title,
    description,
    QuestionnaireId : questionnaireId
  });
}

module.exports.update = function update({ id, title, description }) {
  return Page
    .findById(id)
    .then(page => page.update({ title, description }));
};

module.exports.remove = function remove(id) {
  return Page
    .findById(id)
    .then(page => page.destroy().then(() => page));
};
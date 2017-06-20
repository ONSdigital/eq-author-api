const { Questionnaire } = require("../models");

module.exports.get = function get(id) {
  return Questionnaire.findById(id);
};

module.exports.all = function all() {
  return Questionnaire.all();
};

module.exports.insert = function insert({ title, description, theme, legalBasis, navigation, surveyId }) {
  return Questionnaire.create({
    title,
    description,
    theme,
    legalBasis,
    navigation,
    surveyId
  });
};

module.exports.remove = function remove(id) {
  return Questionnaire
    .findById(id)
    .then(questionnaire => questionnaire.destroy().then(() => questionnaire));
};

module.exports.update = function update({ id, title, description, theme, legalBasis, navigation, surveyId }) {
  return Questionnaire
    .findById(id)
    .then(questionnaire => questionnaire.update({
      title,
      description,
      theme,
      legalBasis,
      navigation,
      surveyId
    }));
}
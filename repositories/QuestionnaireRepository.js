const { head } = require("lodash");
const Questionnaire = require("../models/Questionnaire");


module.exports.get = function(id) {
  return Questionnaire.findById(id);
};

module.exports.all = function() {
  return Questionnaire.findAll();
};

module.exports.insert = function({ title, description, theme, legalBasis, navigation, surveyId }) {
  return Questionnaire
    .create({
      title,
      description,
      theme,
      legalBasis,
      navigation,
      surveyId
    })
    .then(head);
};

module.exports.remove = function(id) {
  return Questionnaire
    .destroy(id)
    .then(head);
};

module.exports.update = function({ id, title, description, theme, legalBasis, navigation, surveyId }) {
  return Questionnaire
    .update(id, {
      title,
      description,
      theme,
      legalBasis,
      navigation,
      surveyId
    })
    .then(head);
}
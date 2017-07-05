const { head } = require("lodash");
const Questionnaire = require("../db/Questionnaire");


module.exports.get = function(id) {
  return Questionnaire.findById(id);
};

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Questionnaire.findAll(where).orderBy(orderBy, direction);
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
      surveyId,
      description,
      theme,
      legalBasis,
      navigation
    })
    .then(head);
}
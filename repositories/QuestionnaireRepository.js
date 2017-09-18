const { head, map, invert } = require("lodash/fp");
const Questionnaire = require("../db/Questionnaire");
const mapFields = require("../utils/mapFields");

const mapping = { created_at: "createdAt" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.get = function(id) {
  return Questionnaire.findById(id).then(fromDb);
};

module.exports.findAll = function findAll(
  where,
  orderBy = "created_at",
  direction = "asc"
) {
  return Questionnaire.findAll(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.insert = function({
  title,
  description,
  theme,
  legalBasis,
  navigation,
  surveyId
}) {
  return Questionnaire.create({
    title,
    description,
    theme,
    legalBasis,
    navigation,
    surveyId
  }).then(head);
};

module.exports.remove = function(id) {
  return Questionnaire.destroy(id).then(head);
};

module.exports.update = function({
  id,
  title,
  description,
  theme,
  legalBasis,
  navigation,
  surveyId
}) {
  return Questionnaire.update(id, {
    title,
    surveyId,
    description,
    theme,
    legalBasis,
    navigation
  }).then(head);
};

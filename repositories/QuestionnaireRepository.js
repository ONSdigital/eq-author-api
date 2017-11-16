const { head, map } = require("lodash/fp");
const Questionnaire = require("../db/Questionnaire");
const mapFields = require("../utils/mapFields");
const mapping = { created_at: "createdAt" }; // eslint-disable-line camelcase
const fromDb = mapFields(mapping);

module.exports.get = function(id) {
  return Questionnaire.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return Questionnaire.findAll()
    .where({ isDeleted: false })
    .where(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.insert = function({
  title,
  description,
  theme,
  legalBasis,
  navigation,
  surveyId,
  summary
}) {
  return Questionnaire.create({
    title,
    description,
    theme,
    legalBasis,
    navigation,
    surveyId,
    summary
  }).then(head);
};

module.exports.update = function({
  id,
  title,
  description,
  theme,
  legalBasis,
  navigation,
  surveyId,
  isDeleted,
  summary
}) {
  return Questionnaire.update(id, {
    title,
    surveyId,
    description,
    theme,
    legalBasis,
    navigation,
    isDeleted,
    summary
  }).then(head);
};

module.exports.remove = function(id) {
  return Questionnaire.update(id, { isDeleted: true }).then(head);
};

module.exports.undelete = function(id) {
  return Questionnaire.update(id, { isDeleted: false }).then(head);
};

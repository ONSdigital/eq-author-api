const { head, map } = require("lodash/fp");
const { omit } = require("lodash");
const Questionnaire = require("../db/Questionnaire");
const mapFields = require("../utils/mapFields");
const mapping = { created_at: "createdAt" }; // eslint-disable-line camelcase
const fromDb = mapFields(mapping);

module.exports.getById = function(id) {
  return Questionnaire.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "desc"
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
  summary,
  createdBy
}) {
  return Questionnaire.create({
    title,
    description,
    theme,
    legalBasis,
    navigation,
    surveyId,
    summary,
    createdBy
  })
    .then(head)
    .then(fromDb);
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
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function(id) {
  const duplicate = (table, condition) => {
    const original = table
      .findAll()
      .where(condition)
      .then(head);

    original.then(result => {
      return table.create(omit(result, "id"));
    });

    return original;
  };

  return duplicate(Questionnaire, {
    id: id
  }).then(result => {
    console.log(result);
  });
};

module.exports.undelete = function(id) {
  return Questionnaire.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

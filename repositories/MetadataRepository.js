const { head, invert, map } = require("lodash/fp");

const Metadata = require("../db/Metadata");
const mapFields = require("../utils/mapFields");
const mapping = { QuestionnaireId: "questionnaireId" };

const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

const TYPE_VALUE = {
  Date: "dateValue",
  Text: "textValue",
  Region: "regionValue",
  Language: "languageValue"
};

module.exports.getById = function(id) {
  return Metadata.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.findAll = function findAll(where = {}) {
  return Metadata.findAll()
    .where({ isDeleted: false })
    .where(where)
    .then(map(fromDb));
};

module.exports.insert = function({ questionnaireId }) {
  return Metadata.create(toDb({ questionnaireId }))
    .then(head)
    .then(fromDb);
};

module.exports.update = function({ id, key, alias, type, ...values }) {
  const typeField = TYPE_VALUE[type];

  return Metadata.update(id, {
    id,
    key,
    alias,
    type,
    value: values[typeField]
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function(id) {
  return Metadata.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

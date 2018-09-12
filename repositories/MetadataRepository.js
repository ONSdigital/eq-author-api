const { head } = require("lodash/fp");

const Metadata = require("../db/Metadata");

const TYPE_VALUE = {
  Date: "dateValue",
  Text: "textValue",
  Region: "regionValue",
  Language: "languageValue"
};

module.exports.getById = function(id) {
  return Metadata.findById(id).where({ isDeleted: false });
};

module.exports.findAll = function findAll(where = {}) {
  return Metadata.findAll()
    .where({ isDeleted: false })
    .where(where);
};

module.exports.insert = function({ questionnaireId }) {
  return Metadata.create({ questionnaireId }).then(head);
};

module.exports.update = function({ id, key, alias, type, ...values }) {
  const typeField = TYPE_VALUE[type];

  return Metadata.update(id, {
    id,
    key,
    alias,
    type,
    value: values[typeField]
  }).then(head);
};

module.exports.remove = function(id) {
  return Metadata.update(id, { isDeleted: true }).then(head);
};

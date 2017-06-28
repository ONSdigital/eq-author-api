const { head, invert, map } = require("lodash/fp");
const Group = require("../db/Group");
const mapFields = require("../utils/mapFields");

const mapping = { QuestionnaireId : "questionnaireId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));


module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Group
    .findAll(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return Group.findById(id).then(fromDb)
};

module.exports.insert = function insert({ title, description, questionnaireId }) {
  return Group
    .create(toDb({
      title,
      description,
      questionnaireId
    }))
    .then(head)
    .then(fromDb);
}

module.exports.update = function update({ id, title, description }) {
  return Group
    .update(id, {
      title,
      description
    })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Group
    .destroy(id)
    .then(head)
    .then(fromDb);
};
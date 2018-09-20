const { get, head, pick } = require("lodash/fp");
const Section = require("../db/Section");
const db = require("../db");
const {
  getOrUpdateOrderForSectionInsert
} = require("./strategies/spacedOrderStrategy");

module.exports.findAll = function findAll(
  where = {},
  orderBy = "position",
  direction = "asc"
) {
  return db("SectionsView")
    .select("*")
    .where(where)
    .orderBy(orderBy, direction);
};

module.exports.getById = function getById(id) {
  return db("SectionsView")
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.insert = function insert(args) {
  const { questionnaireId, position } = args;
  return db.transaction(trx => {
    return getOrUpdateOrderForSectionInsert(
      trx,
      questionnaireId,
      null,
      position
    )
      .then(order => Object.assign(args, { order }))
      .then(pick(["title", "alias", "questionnaireId", "order"]))
      .then(section => Section.create(section, trx))
      .then(head);
  });
};

module.exports.update = function update({ id, title, alias, isDeleted }) {
  return Section.update(id, {
    title,
    alias,
    isDeleted
  }).then(head);
};

module.exports.remove = function remove(id) {
  return Section.update(id, { isDeleted: true }).then(head);
};

module.exports.undelete = function(id) {
  return Section.update(id, { isDeleted: false }).then(head);
};

module.exports.move = function({ id, questionnaireId, position }) {
  return db.transaction(trx => {
    return getOrUpdateOrderForSectionInsert(trx, questionnaireId, id, position)
      .then(order => Section.update(id, { questionnaireId, order }, trx))
      .then(head)

      .then(section => Object.assign(section, { position }));
  });
};

module.exports.getPosition = function({ id }) {
  return this.getById(id).then(get("position"));
};

module.exports.getSectionCount = function getSectionCount(questionnaireId) {
  return db("SectionsView")
    .count()
    .where({ questionnaireId })
    .then(head)
    .then(get("count"));
};

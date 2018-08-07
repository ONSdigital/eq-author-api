const { get, head, invert, map, pick } = require("lodash/fp");
const Section = require("../db/Section");
const mapFields = require("../utils/mapFields");
const mapping = { QuestionnaireId: "questionnaireId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));
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
    .where(toDb(where))
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.getById = function getById(id) {
  return db("SectionsView")
    .where("id", parseInt(id, 10))
    .first()
    .then(fromDb);
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
      .then(pick(["title", "questionnaireId", "order"]))
      .then(toDb)
      .then(section => Section.create(section, trx))
      .then(head)
      .then(fromDb);
  });
};

module.exports.update = function update({ id, title, isDeleted }) {
  return Section.update(id, {
    title,
    isDeleted
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return Section.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return Section.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.move = function({ id, questionnaireId, position }) {
  return db.transaction(trx => {
    return getOrUpdateOrderForSectionInsert(trx, questionnaireId, id, position)
      .then(order => Section.update(id, toDb({ questionnaireId, order }), trx))
      .then(head)
      .then(fromDb)
      .then(section => Object.assign(section, { position }));
  });
};

module.exports.getPosition = function({ id }) {
  return this.getById(id).then(get("position"));
};

module.exports.getSectionCount = function getSectionCount(questionnaireId) {
  return db("SectionsView")
    .count()
    .where({ QuestionnaireId: questionnaireId })
    .then(head)
    .then(get("count"));
};

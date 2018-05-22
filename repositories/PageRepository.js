const { map, head, invert, get } = require("lodash/fp");
const Page = require("../db/Page");
const QuestionPageRepository = require("./QuestionPageRepository");
const mapFields = require("../utils/mapFields");
const db = require("../db");
const {
  getOrUpdateOrderForInsert
} = require("./strategies/spacedOrderStrategy");

const mapping = { SectionId: "sectionId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

function getRepositoryForType({ pageType }) {
  switch (pageType) {
    case "QuestionPage":
      return QuestionPageRepository;
    default:
      throw new TypeError(`Unknown pageType: '${pageType}'`);
  }
}

function findAll(where = {}, orderBy = "position", direction = "asc") {
  return db("PagesView")
    .select("*")
    .where(toDb(where))
    .orderBy(orderBy, direction)
    .then(map(fromDb));
}

function getById(id) {
  return db("PagesView")
    .where("id", parseInt(id, 10))
    .first()
    .then(fromDb);
}

function insert(args) {
  const repository = getRepositoryForType(args);
  const { sectionId, position } = args;

  return db.transaction(trx => {
    return getOrUpdateOrderForInsert(trx, sectionId, null, position)
      .then(order => Object.assign(args, { order }))
      .then(page => repository.insert(page, trx));
  });
}

function update(args) {
  const repository = getRepositoryForType(args);
  return repository.update(args);
}

function remove(id) {
  return Page.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
}

function undelete(id) {
  return Page.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
}

function move({ id, sectionId, position }) {
  return db.transaction(trx => {
    return getOrUpdateOrderForInsert(trx, sectionId, id, position)
      .then(order => Page.update(id, toDb({ sectionId, order }), trx))
      .then(head)
      .then(fromDb)
      .then(page => Object.assign(page, { position }));
  });
}

function getPosition({ id }) {
  return getById(id).then(get("position"));
}

Object.assign(module.exports, {
  findAll,
  get: getById,
  insert,
  update,
  remove,
  undelete,
  move,
  getPosition
});

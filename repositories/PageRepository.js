const { map, head, invert, get } = require("lodash/fp");
const updateTitle = require("../utils/updateTitle");
const Page = require("../db/Page");
const QuestionPageRepository = require("./QuestionPageRepository");
const mapFields = require("../utils/mapFields");
const { duplicatePageStrategy } = require("./strategies/duplicateStrategy");
const db = require("../db");
const {
  getOrUpdateOrderForPageInsert
} = require("./strategies/spacedOrderStrategy");

const {
  getAvailableRoutingDestinations,
  handlePageDeleted
} = require("./strategies/routingStrategy");

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
    return getOrUpdateOrderForPageInsert(trx, sectionId, null, position)
      .then(order => Object.assign(args, { order }))
      .then(page => repository.insert(page, trx));
  });
}

function update(args) {
  const repository = getRepositoryForType(args);
  return repository.update(args);
}

const deletePage = async (trx, id) => {
  const deletedPage = await trx("Pages")
    .where({ id: parseInt(id, 10) })
    .update({ isDeleted: true })
    .returning("*")
    .then(head)
    .then(fromDb);

  await handlePageDeleted(trx, id);

  return deletedPage;
};

const remove = id => db.transaction(trx => deletePage(trx, id));

function undelete(id) {
  return Page.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
}

function move({ id, sectionId, position }) {
  return db.transaction(trx => {
    return getOrUpdateOrderForPageInsert(trx, sectionId, id, position)
      .then(order => Page.update(id, toDb({ sectionId, order }), trx))
      .then(head)
      .then(fromDb)
      .then(page => Object.assign(page, { position }));
  });
}

function getPosition({ id }) {
  return getById(id).then(get("position"));
}

function getRoutingDestinations(pageId) {
  return db.transaction(trx => getAvailableRoutingDestinations(trx, pageId));
}

function duplicatePage(id, position) {
  return db.transaction(async trx => {
    const page = await trx
      .select("*")
      .from("Pages")
      .where({ id })
      .then(head);

    return duplicatePageStrategy(trx, page, position, {
      title: updateTitle(page.title)
    }).then(fromDb);
  });
}

Object.assign(module.exports, {
  findAll,
  getById,
  insert,
  update,
  remove,
  undelete,
  move,
  getPosition,
  getRoutingDestinations,
  duplicatePage
});

const { map, head, invert, get } = require("lodash/fp");
const Page = require("../db/Page");
const QuestionPageRepository = require("./QuestionPageRepository");
const mapFields = require("../utils/mapFields");
const db = require("../db");
const {
  movePage,
  getNextOrderValue
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

  return db.transaction(trx => {
    // for some reason mutating causes app to hang
    // so we have to immutably add in `order`
    args = Object.assign({}, args, {
      order: getNextOrderValue(trx, args.sectionId)
    });

    const result = repository.insert(args, trx);

    if (args.position === undefined) {
      return result;
    }

    return result
      .then(({ id, sectionId }) =>
        movePage(trx, {
          id,
          sectionId,
          position: args.position
        })
      )
      .then(fromDb);
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
  return db.transaction(trx =>
    movePage(trx, { id, sectionId, position }).then(fromDb)
  );
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

const { map, head, invert } = require("lodash/fp");
const Page = require("../db/Page");
const QuestionPageRepository = require("./QuestionPageRepository");
const mapFields = require("../utils/mapFields");
const db = require("../db");
const {
  movePage,
  getNextOrderValue,
  calculatedPositionCol,
  getPosition
} = require("./strategies/spacedOrderStrategy");

const {
  getAvailableRoutingDestinations
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

module.exports.findAll = function findAll(
  where = {},
  orderBy = "position",
  direction = "asc"
) {
  return Page.findAll()
    .columns("*", calculatedPositionCol(db))
    .where({ isDeleted: false })
    .where(toDb(where))
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.get = function get(id) {
  return Page.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = function insert(args) {
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
};

module.exports.update = function update(args) {
  const repository = getRepositoryForType(args);
  return repository.update(args);
};

module.exports.remove = function remove(id) {
  return Page.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return Page.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.move = ({ id, sectionId, position }) => {
  return db.transaction(trx =>
    movePage(trx, { id, sectionId, position }).then(fromDb)
  );
};

module.exports.getPosition = ({ id }) => {
  return Page.findById(id).then(({ SectionId }) =>
    getPosition(db, SectionId, id)
  );
};

module.exports.getRoutingDestinations = function(id) {
  return db.transaction(trx => getAvailableRoutingDestinations(trx, id));
};

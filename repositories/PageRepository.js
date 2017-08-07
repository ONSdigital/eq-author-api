const { map, head } = require("lodash/fp");
const Page = require("../db/Page");
const QuestionPageRepository = require("./QuestionPageRepository");
const mapFields = require("../utils/mapFields");

const fromDb = mapFields({ SectionId: "sectionId" });

function getRepositoryForType({ pageType }) {
  switch (pageType) {
    case "QuestionPage":
      return QuestionPageRepository;
    default:
      throw new TypeError(`Unknown pageType: '${pageType}'`);
  }
}

module.exports.findAll = function findAll(
  where,
  orderBy = "created_at",
  direction = "asc"
) {
  return Page.findAll(where).orderBy(orderBy, direction).then(map(fromDb));
};

module.exports.get = function get(id) {
  return Page.findById(id).then(fromDb);
};

module.exports.insert = function insert(args) {
  const repository = getRepositoryForType(args);

  return repository.insert(args);
};

module.exports.update = function update(args) {
  const repository = getRepositoryForType(args);

  return repository.update(args);
};

module.exports.remove = function remove(id) {
  return Page.destroy(id).then(head).then(fromDb);
};

const Page = require("../db/Page");
const QuestionRepository = require("./QuestionRepository");

function getRepositoryForType({ pageType }) {
  switch(pageType) {
    case "Question":
      return QuestionRepository;
    default:
      throw new TypeError(`Unknown pageType: '${pageType}'`);
  }
}

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Page.findAll(where).orderBy(orderBy, direction);
};

module.exports.get = function get(id) {
  return Page.findById(id);
};

module.exports.insert = function insert(args) {
  const repository = getRepositoryForType(args);
  
  return repository.insert(args);
}

module.exports.update = function update(args) {
  const repository = getRepositoryForType(args);

  return repository.update(args);
};

module.exports.remove = function remove(args) {
  const repository = getRepositoryForType(args);

  return repository.remove(args.id);
};
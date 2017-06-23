const { head } = require("lodash");
const Page = require("../models/Page");
const QuestionRepository = require("./QuestionRepository");

function getRepositoryForType({ type }) {
  switch(type) {
    case "Question":
      return QuestionRepository;
    default:
      throw new TypeError(`Unknown Page type: '${type}'`);
  }
}

module.exports.findAll = function findAll(where) {
  return Page.findAll(where);
};

module.exports.get = function get(id) {
  return Page.findById(id);
};

module.exports.insert = function insert(args) {
  const repository = getRepositoryForType(args);
  
  return repository
    .create(args)
    .then(head);
}

module.exports.update = function update(args) {
  const repository = getRepositoryForType(args);

  return repository
    .update(args)
    .then(head);
};

module.exports.remove = function remove(args) {
  const repository = getRepositoryForType(args);

  return repository
    .destroy(args.id)
    .then(head);
};
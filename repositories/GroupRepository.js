const { head } = require("lodash");
const Group = require("../models/Group");

module.exports.findAll = function findAll(where, orderBy = "created_at", direction = "asc") {
  return Group.findAll(where).orderBy(orderBy, direction);
};

module.exports.get = function get(id) {
  return Group.findById(id);
};

module.exports.insert = function insert(args) {
  return Group
    .create(args)
    .then(head);
}

module.exports.update = function update(args) {
  return Group
    .update(args)
    .then(head);
};

module.exports.remove = function remove(args) {
  return Group
    .destroy(args.id)
    .then(head);
};
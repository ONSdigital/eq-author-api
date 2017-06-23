const db = require("../db");

function Question() {
  return db("Questions");
}

module.exports.findAll = function findAll(where) {
  return Question()
    .where(where)
    .select();
};


module.exports.findById = function findById(id) {
  return Question()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.update = function update(id, updates) {
  return Question()
    .where("id", parseInt(id, 10))
    .update(updates)
    .returning("*");
};

module.exports.create = function create(obj) {
  return Question()
    .insert(obj)
    .returning("*");
};

module.exports.destroy = function destroy(id) {
  return Question()
    .where("id", parseInt(id, 10))
    .delete()
    .returning("*");
}
const db = require("../db");

function Answer() {
  return db("Answers");
}

module.exports.findAll = function findAll(where) {
  return Answer()
    .where(where)
    .select();
};


module.exports.findById = function findById(id) {
  return Answer()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.update = function update(id, updates) {
  return Answer()
    .where("id", parseInt(id, 10))
    .update(updates)
    .returning("*");
};

module.exports.create = function create(answer) {
  return Answer()
    .insert(answer)
    .returning("*");
};

module.exports.destroy = function destroy(id) {
  return Answer()
    .where("id", parseInt(id, 10))
    .delete()
    .returning("*");
}
const db = require("./index");

function Question() {
  return db("Pages");
}

function restrictType(where) {
  return Object.assign({}, where, { pageType : "Question" });
}

module.exports.findAll = function findAll(where = {}) {
  return Question()
    .where(restrictType(where))
    .select();
};


module.exports.findById = function findById(id) {
  return Question()
    .where(restrictType({ id: parseInt(id, 10) }))
    .first();
};

module.exports.update = function update(id, updates) {
  return Question()
    .where(restrictType({ id: parseInt(id, 10) }))
    .update(updates)
    .returning("*");
};

module.exports.create = function create(obj) {
  return Question()
    .insert(restrictType(obj))
    .returning("*");
};

module.exports.destroy = function destroy(id) {
  return Question()
    .where(restrictType({ id: parseInt(id, 10) }))
    .delete()
    .returning("*");
}
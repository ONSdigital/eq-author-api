const db = require("./");

function Group() {
  return db("Groups");
}

module.exports.findAll = function findAll(where = {}) {
  return Group()
    .where(where)
    .select();
};

module.exports.findById = function findById(id) {
  return Group()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.update = function update(id, updates) {
  return Group()
    .where({ "id" : parseInt(id, 10) })
    .update(updates)
    .returning("*");
};

module.exports.create = function create(obj) {
  return Group()
    .insert(obj)
    .returning("*");
};

module.exports.destroy = function destroy(id) {
  return Group()
    .where({ "id" : parseInt(id, 10) })
    .delete()
    .returning("*");
}
const db = require("./");

function Page() {
  return db("Pages");
}

module.exports.findAll = function findAll(where = {}) {
  return Page()
    .where(where)
    .select();
};

module.exports.findById = function findById(id) {
  return Page()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.update = function update(id, updates) {
  return Page()
    .where({ "id" : parseInt(id, 10) })
    .update(updates)
    .returning("*");
};

module.exports.create = function create(obj) {
  return Page()
    .insert(obj)
    .returning("*");
};

module.exports.destroy = function destroy(id) {
  return Page()
    .where({ "id" : parseInt(id, 10) })
    .delete()
    .returning("*");
}
exports.up = function(knex, Promise) {
  return knex.schema.table("Pages", function(table) {
    table.dropColumn("type");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("Pages", function(table) {
    table
      .string("type")
      .notNullable()
      .defaultsTo("General");
  });
};

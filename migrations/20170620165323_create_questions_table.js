
exports.up = function(knex) {
  return knex.schema.createTable("Questions", function(table) {
    table.increments();
    table.timestamps();
    table.string("title").notNullable();
    table.text("description");
    table.text("guidance");
    table.enum("type", [
      "General",
      "DateRange",
      "RepeatingAnswer",
      "Relationship"
    ]).notNullable();
    table.boolean("mandatory").notNullable().defaultsTo(false);

    table.integer('PageId')
      .unsigned()
      .index()
      .references('id')
      .inTable('Pages')
      .onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("Questions");
};

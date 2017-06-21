
exports.up = function(knex) {
  return knex.schema.createTable("Pages", function(table) {
    table.increments();
    table.timestamps();

    table.string("title").notNullable();
    table.text("description");

    table.integer('QuestionnaireId')
      .unsigned()
      .index()
      .references('id')
      .inTable('Questionnaires')
      .onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("Pages");
};

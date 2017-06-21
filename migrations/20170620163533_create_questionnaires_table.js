
exports.up = function(knex) {
  return knex.schema.createTable("Questionnaires", function(table) {
    table.increments();
    table.timestamps();

    table.string("title").notNullable();
    table.string("surveyId").notNullable();
    table.text("description");
    table.string("theme").notNullable();
    table.enum("legalBasis", [
      "Voluntary",
      "StatisticsOfTradeAct"
    ]).notNullable();
    table.bool("navigation").notNullable().defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("Questionnaires");
};

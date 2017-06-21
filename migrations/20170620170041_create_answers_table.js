
exports.up = function(knex) {
  return knex.schema.createTable("Answers", function(table) {
    table.increments();
    table.timestamps();

    table.text("description");
    table.text("guidance");
    table.string("qCode");
    table.string("label");
    table.enum("type", [
      "Checkbox",
      "Currency",
      "Date",
      "MonthYearDate",
      "Integer",
      "Percentage",
      "PositiveInteger",
      "Radio",
      "TextArea",
      "TextField",
      "Relationship"
    ]).notNullable();
    table.boolean("mandartory").notNullable().defaultsTo(false);

    table.integer('QuestionId')
      .unsigned()
      .index()
      .references('id')
      .inTable('Questions')
      .onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("Answers");
};

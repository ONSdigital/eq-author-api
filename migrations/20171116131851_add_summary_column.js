const QUESTIONNAIRES_TABLE = "Questionnaires";
const SUMMARY_COLUMN = "summary";

exports.up = function(knex) {
  return knex.schema.table(QUESTIONNAIRES_TABLE, table => {
    table
      .boolean(SUMMARY_COLUMN)
      .notNullable()
      .defaultsTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table(QUESTIONNAIRES_TABLE, table => {
    table.dropColumn(SUMMARY_COLUMN);
  });
};

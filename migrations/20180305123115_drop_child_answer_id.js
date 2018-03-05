const CHILD_ANSWER_ID_COL_NAME = "childAnswerId";
const OTHER_ANSWER_ID_COL_NAME = "otherAnswerId";

exports.up = async function(knex) {
  await knex.schema.table("Options", function(table) {
    table.dropColumn(CHILD_ANSWER_ID_COL_NAME);
  });
  await knex.schema.table("Answers", function(table) {
    table.integer(OTHER_ANSWER_ID_COL_NAME).defaultTo(null);
  });
};

exports.down = async function(knex) {
  await knex.schema.table("Answers", function(table) {
    table.dropColumn(OTHER_ANSWER_ID_COL_NAME);
  });
  await knex.schema.table("Options", function(table) {
    table.integer(CHILD_ANSWER_ID_COL_NAME);
  });
};

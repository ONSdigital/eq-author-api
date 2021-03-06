const {
  CUSTOM,
  PREVIOUS_ANSWER
} = require("../constants/validationEntityTypes");

exports.up = function(knex) {
  return knex.schema.table("Validation_AnswerRules", table => {
    table
      .enum("entityType", [CUSTOM, PREVIOUS_ANSWER])
      .defaultsTo(CUSTOM)
      .notNullable();
  });
};

exports.down = function() {
  return Promise.resolve();
};

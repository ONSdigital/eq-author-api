exports.up = function(knex) {
  return knex.schema.table("Validation_AnswerRules", table => {
    table
      .enum("entityType", ["Custom", "PreviousAnswer"])
      .defaultsTo("Custom")
      .notNullable();
  });
};

exports.down = function() {
  return Promise.resolve();
};

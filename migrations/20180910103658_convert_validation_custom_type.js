exports.up = async function(knex) {
  await knex.raw(
    `ALTER TABLE "Validation_AnswerRules"
  	ALTER COLUMN "custom" TYPE text;`
  );
};

exports.down = () => Promise.resolve();

exports.up = async function(knex, Promise) {
  const ids = await knex
    .select("Validation_AnswerRules.id")
    .from("Validation_AnswerRules")
    .where({ validationType: "latestDate" });

  const updates = ids.map(({ id }) =>
    knex.raw(
      `update "Validation_AnswerRules" set "config" = '{"offset":{"value":0,"unit":"Days"},"relativePosition":"After"}' where "id" = ${id}`
    )
  );
  return Promise.all(updates);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};

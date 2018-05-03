const { head } = require("lodash/fp");

module.exports.updateConditions = async function updateConditions(
  trx,
  { id, answerId }
) {
  await updateValuesTable(trx, { id });
  return await updateConditionsTable(trx, { id, answerId });
};

module.exports.createOrRemoveValue = async function createOrRemoveValue(
  trx,
  { optionId, conditionId, checked }
) {
  if (checked) {
    return trx("Routing_ConditionValues")
      .insert({ OptionId: optionId, ConditionId: conditionId })
      .returning("*")
      .then(head);
  } else
    return trx("Routing_ConditionValues")
      .where({ OptionId: optionId })
      .del()
      .returning("*")
      .then(head);
};

const updateConditionsTable = async (trx, { id, answerId }) =>
  trx("Routing_Conditions")
    .where({ id })
    .update({
      AnswerId: answerId
    })
    .returning("*")
    .then(head);

const updateValuesTable = async (trx, { id }) =>
  trx("Routing_ConditionValues")
    .where({ ConditionId: id })
    .del()
    .returning("*")
    .then(head);

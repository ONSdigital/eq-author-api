const { head, invert, map } = require("lodash/fp");
const { concat, parseInt } = require("lodash");

const mapping = {
  SectionId: "sectionId",
  QuestionPageId: "questionPageId",
  ElseDestination: "elseDestination",
  RoutingRuleSetId: "routingRuleSetId",
  RuleDestination: "ruleDestination",
  RoutingRuleId: "routingRuleId",
  AnswerId: "answerId",
  OptionId: "optionId",
  ConditionId: "conditionId"
};
const mapFields = require("../../utils/mapFields");
const toDb = mapFields(invert(mapping));
const fromDb = mapFields(mapping);

const updateConditionsTable = async (trx, id, answerId) =>
  trx("Routing_Conditions")
    .where({ id })
    .update(
      toDb({
        answerId
      })
    )
    .returning("*")
    .then(head);

const deleteRoutingConditionValues = async (trx, conditionId) =>
  trx("Routing_ConditionValues")
    .where(toDb({ conditionId }))
    .del()
    .returning("*")
    .then(head);

const getConditionAnswerId = async (trx, id) =>
  trx("Routing_Conditions")
    .select("AnswerId")
    .where({ id })
    .then(head);

const getPage = async (trx, id) =>
  trx("Pages")
    .select("*")
    .where({ id })
    .then(head);

const getSection = async (trx, { SectionId }) =>
  trx("Sections")
    .select("*")
    .where({ id: SectionId })
    .then(head);

const getDestinationsInSection = async (trx, { SectionId, order }) =>
  trx("Pages")
    .select("*")
    .where({ SectionId, isDeleted: false })
    .where("order", ">", order)
    .then(map(fromDb));

const getSectionsAheadOfPage = async (
  trx,
  { SectionId },
  { QuestionnaireId }
) =>
  trx("Sections")
    .select("*")
    .where({ QuestionnaireId, isDeleted: false })
    .where("id", ">", SectionId);

module.exports.updateConditions = async function updateConditions(
  trx,
  { id: conditionId, answerId }
) {
  const prevAnswerId = await getConditionAnswerId(trx, conditionId);
  if (parseInt(answerId) === prevAnswerId.AnswerId) {
    return;
  } else {
    await deleteRoutingConditionValues(trx, conditionId);
    return updateConditionsTable(trx, conditionId, answerId);
  }
};

module.exports.createOrRemoveValue = async function createOrRemoveValue(
  trx,
  { optionId, conditionId, checked }
) {
  if (checked) {
    return trx("Routing_ConditionValues")
      .insert(toDb({ optionId, conditionId }))
      .returning("*")
      .then(head);
  } else {
    return trx("Routing_ConditionValues")
      .where(toDb({ optionId }))
      .del()
      .returning("*")
      .then(head);
  }
};

module.exports.getAvailableRoutingDestinations = async function getAvailableRoutingDestinations(
  trx,
  pageId
) {
  const page = await getPage(trx, pageId);
  const section = await getSection(trx, page);
  const destinationsInSection = await getDestinationsInSection(trx, page);
  const sectionsAheadOfPage = await getSectionsAheadOfPage(trx, page, section);

  return concat(destinationsInSection, sectionsAheadOfPage);
};

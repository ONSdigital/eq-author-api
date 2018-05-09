const { head } = require("lodash/fp");
const { concat } = require("lodash");

module.exports.updateConditions = async function updateConditions(
  trx,
  { id, answerId }
) {
  const prevAnswerId = await getConditionAnswerId(trx, { id });
  if (answerId == prevAnswerId.AnswerId) {
    return;
  } else {
    await updateValuesTable(trx, { id });
    return await updateConditionsTable(trx, { id, answerId });
  }
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

module.exports.getAvailableRoutingDestinations = async function getAvailableRoutingDestinations(
  trx,
  id
) {
  const sectionId = await getSectionId(trx, id);
  const questionnaireId = await getQuestionnaireId(trx, sectionId);
  const destinationsInSection = await getDestinationsInSection(trx, sectionId);
  const sectionsAheadOfPage = await getSectionsAheadOfPage(
    trx,
    questionnaireId,
    sectionId
  );
  const destinationsOutsideSection = await getDestinationsOutsideSection(
    trx,
    sectionsAheadOfPage
  );
  const destinations = concat(
    destinationsInSection,
    destinationsOutsideSection
  );
  return destinations.map(destination => destination.id);
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

const getConditionAnswerId = async (trx, { id }) =>
  trx("Routing_Conditions")
    .select("AnswerId")
    .where({ id })
    .then(head);

const getSectionId = async (trx, id) =>
  trx("Pages")
    .select("SectionId", "order")
    .where({ id })
    .then(head);

const getQuestionnaireId = async (trx, { SectionId }) =>
  trx("Sections")
    .select("QuestionnaireId", "id")
    .where({ id: SectionId })
    .then(head);

const getDestinationsInSection = async (trx, { SectionId, order }) =>
  trx("Pages")
    .select("id")
    .where({ SectionId })
    .where("order", ">", order);

const getSectionsAheadOfPage = async (
  trx,
  { QuestionnaireId },
  { SectionId }
) =>
  trx("Sections")
    .select("id")
    .where({ QuestionnaireId })
    .where("id", ">", SectionId);

const getDestinationsOutsideSection = async (trx, sectionIds) => {
  const idArray = sectionIds.map(sectionId => sectionId.id);
  return trx("Pages")
    .select("id")
    .from(function() {
      this.select("SectionId")
        .from("Pages")
        .min("order as min")
        .whereIn("SectionId", idArray)
        .groupBy("SectionId")
        .as("firstPages");
    })
    .innerJoin("Pages", function() {
      this.on("firstPages.SectionId", "=", "Pages.SectionId").andOn(
        "firstPages.min",
        "=",
        "Pages.order"
      );
    });
};

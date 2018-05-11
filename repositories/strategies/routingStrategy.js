const { head } = require("lodash/fp");
const { concat, parseInt } = require("lodash");

const updateConditionsTable = async (trx, { id, answerId }) =>
  trx("Routing_Conditions")
    .where({ id })
    .update({
      AnswerId: answerId
    })
    .returning("*")
    .then(head);

const deleteRoutingConditionValues = async (trx, { id }) =>
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
    .where({ SectionId, isDeleted: false })
    .where("order", ">", order);

const getSectionsAheadOfPage = async (
  trx,
  { QuestionnaireId },
  { SectionId }
) =>
  trx("Sections")
    .select("id")
    .where({ QuestionnaireId, isDeleted: false })
    .where("id", ">", SectionId);

const getDestinationsOutsideSection = async (trx, sections) => {
  const sectionIds = sections.map(section => section.id);
  return trx("Pages")
    .select("id")
    .from(function() {
      this.select("SectionId")
        .from("Pages")
        .min("order as min")
        .where({ isDeleted: false })
        .whereIn("SectionId", sectionIds)
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

module.exports.updateConditions = async function updateConditions(
  trx,
  { id, answerId }
) {
  const prevAnswerId = await getConditionAnswerId(trx, { id });
  if (parseInt(answerId) === prevAnswerId.AnswerId) {
    return;
  } else {
    await deleteRoutingConditionValues(trx, { id });
    return updateConditionsTable(trx, { id, answerId });
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
  } else {
    return trx("Routing_ConditionValues")
      .where({ OptionId: optionId })
      .del()
      .returning("*")
      .then(head);
  }
};

module.exports.getAvailableRoutingDestinations = async function getAvailableRoutingDestinations(
  trx,
  pageId
) {
  const sectionId = await getSectionId(trx, pageId);
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
  return concat(destinationsInSection, destinationsOutsideSection);
};

const { head } = require("lodash/fp");
const { parseInt, isNil, find, isEmpty, get } = require("lodash");

const updateAllRoutingConditions = (trx, where, values) =>
  trx("Routing_Conditions")
    .where(where)
    .update(values)
    .returning("*");

const updateRoutingCondition = (trx, id, questionPageId, answerId) =>
  trx("Routing_Conditions")
    .where({ id })
    .update({
      questionPageId,
      answerId
    })
    .returning("*")
    .then(head);

const getFirstAnswer = (trx, questionPageId) =>
  trx("Answers")
    .where({ questionPageId, isDeleted: false })
    .orderBy("id")
    .first();

const findAnswerByIdAndQuestionPageId = (trx, id, questionPageId) =>
  trx("Answers")
    .where({ isDeleted: false })
    .where({ id, questionPageId })
    .then(head);

const deleteRoutingConditionValues = (trx, where) =>
  trx("Routing_ConditionValues")
    .where(where)
    .del();

const getPageById = (trx, id) =>
  trx("PagesView")
    .where({ id })
    .first();

const getSectionById = (trx, id) =>
  trx("Sections")
    .where({ id, isDeleted: false })
    .first();

const getPageDestinations = (trx, { sectionId, order }) =>
  trx("PagesView")
    .where({ sectionId })
    .where("order", ">", order);

const getSectionDestinations = (trx, { id, questionnaireId }) =>
  trx("Sections")
    .select("*")
    .where({ questionnaireId, isDeleted: false })
    .where("id", ">", id)
    .orderBy("createdAt", "asc");

const findRoutingRuleSet = (trx, questionPageId) =>
  trx("Routing_RuleSets")
    .where({ questionPageId, isDeleted: false })
    .first();

const getRoutingRuleSetById = (trx, routingRuleSetId) => {
  return trx("Routing_RuleSets")
    .where({ id: routingRuleSetId, isDeleted: false })
    .first();
};

const insertRoutingCondition = (trx, routingCondition) =>
  trx("Routing_Conditions")
    .insert(routingCondition)
    .returning("*")
    .then(head);

const insertRoutingRule = (trx, routingRule) =>
  trx("Routing_Rules")
    .insert(routingRule)
    .returning("*")
    .then(head);

const insertRoutingRuleSet = async (
  trx,
  { questionPageId, routingDestinationId }
) =>
  trx("Routing_RuleSets")
    .insert({
      questionPageId: parseInt(questionPageId),
      routingDestinationId: parseInt(routingDestinationId)
    })

    .returning("*")
    .then(head);

const checkAnswerBelongsToPage = async (trx, answerId, questionPageId) => {
  if (isNil(answerId)) {
    return;
  }

  const answer = await findAnswerByIdAndQuestionPageId(
    trx,
    answerId,
    questionPageId
  );
  if (!answer) {
    throw new Error(
      `Answer ${answerId} does not belong to ${questionPageId}. Choose a different answer.`
    );
  }
};

const getAnswerOrFirstAnswerOnPage = async (trx, answerId, questionPageId) => {
  if (!isNil(answerId)) {
    return answerId;
  }
  const firstAnswer = await getFirstAnswer(trx, questionPageId);
  return get(firstAnswer, "id", null);
};

const updateRoutingConditionStrategy = async (
  trx,
  { id: routingConditionId, questionPageId, answerId }
) => {
  await checkAnswerBelongsToPage(trx, answerId, questionPageId);
  const routingConditionAnswer = await getAnswerOrFirstAnswerOnPage(
    trx,
    answerId,
    questionPageId
  );
  await deleteRoutingConditionValues(trx, {
    conditionId: routingConditionId
  });
  return updateRoutingCondition(
    trx,
    routingConditionId,
    questionPageId,
    routingConditionAnswer
  );
};

const toggleConditionOptionStrategy = async (
  trx,
  { conditionId, optionId, checked }
) => {
  const table = trx("Routing_ConditionValues");
  const where = { optionId, conditionId };
  const existing = await table.where(where);

  if (!isEmpty(existing) && checked) {
    throw new Error("A condition value already exists");
  }

  const query = checked
    ? table.insert({ conditionId, optionId })
    : table.where({ optionId }).del();

  return query.returning("*").then(head);
};

async function getAvailableRoutingDestinations(trx, pageId) {
  const page = await getPageById(trx, pageId);
  const section = await getSectionById(trx, page.sectionId);
  const questionPages = await getPageDestinations(trx, page);
  const sections = await getSectionDestinations(trx, section);

  return {
    questionPages,
    sections
  };
}

const checkRoutingDestinations = async (
  availableRoutingDestinations,
  destination
) => {
  const { logicalDestinations } = availableRoutingDestinations;
  const { logicalDestination, absoluteDestination } = destination;

  if (!isNil(logicalDestination)) {
    if (
      !find(logicalDestinations, {
        logicalDestination: logicalDestination.destinationType
      })
    ) {
      throw new Error(
        `Unable to route from this question ${
          logicalDestination.destinationType
        }`
      );
    }
  }

  if (!isNil(absoluteDestination)) {
    const { destinationType, destinationId } = absoluteDestination;
    const key =
      destinationType === "QuestionPage" ? "questionPages" : "sections";
    if (
      !find(availableRoutingDestinations[key], { id: parseInt(destinationId) })
    ) {
      throw new Error(
        `Unable to route from this question to ${destinationType} ${destinationId}`
      );
    }
  }
};

async function createRoutingConditionStrategy(trx, routingCondition) {
  const { questionPageId, answerId } = routingCondition;
  let firstAnswerOnPage;
  if (isNil(answerId)) {
    firstAnswerOnPage = await getFirstAnswer(trx, questionPageId);
  }

  return insertRoutingCondition(trx, {
    ...routingCondition,
    answerId: get(firstAnswerOnPage, "id", answerId)
  });
}

const createRoutingDestination = async trx =>
  trx("Routing_Destinations")
    .insert({})
    .returning("*")
    .then(head);

async function createRoutingRuleStrategy(
  trx,
  { routingRuleSetId, operation = "And" }
) {
  const routingDestination = await createRoutingDestination(trx);

  const routingRule = await insertRoutingRule(trx, {
    operation,
    routingRuleSetId,
    routingDestinationId: routingDestination.id
  });

  const routingRuleSet = await getRoutingRuleSetById(
    trx,
    routingRule.routingRuleSetId
  );

  await createRoutingConditionStrategy(trx, {
    comparator: "Equal",
    routingRuleId: routingRule.id,
    questionPageId: routingRuleSet.questionPageId
  });

  return routingRule;
}

async function createRoutingRuleSetStrategy(trx, questionPageId) {
  const existingRuleSet = await findRoutingRuleSet(trx, questionPageId);
  if (!isNil(existingRuleSet)) {
    throw new Error(
      `Cannot add a second RoutingRuleSet to question ${questionPageId}. Delete the existing one first.`
    );
  }

  const routingDestination = await createRoutingDestination(trx);
  const routingRuleSetDefaults = {
    questionPageId,
    routingDestinationId: routingDestination.id
  };

  const routingRuleSet = await insertRoutingRuleSet(
    trx,
    routingRuleSetDefaults
  );

  const routingRuleInput = {
    routingRuleSetId: routingRuleSet.id
  };

  await createRoutingRuleStrategy(trx, routingRuleInput);
  return routingRuleSet;
}

const handlePageDeleted = (trx, pageId) =>
  updateAllRoutingConditions(
    trx,
    {
      questionPageId: parseInt(pageId)
    },
    {
      questionPageId: null,
      answerId: null
    }
  );

const handleAnswerDeleted = (trx, answerId) =>
  updateAllRoutingConditions(
    trx,
    {
      answerId: parseInt(answerId)
    },
    {
      questionPageId: null,
      answerId: null
    }
  );

const handleOptionDeleted = (trx, optionId) =>
  deleteRoutingConditionValues(trx, {
    optionId: parseInt(optionId)
  });

Object.assign(module.exports, {
  checkRoutingDestinations,
  getAvailableRoutingDestinations,
  toggleConditionOptionStrategy,
  updateRoutingConditionStrategy,
  createRoutingRuleSetStrategy,
  createRoutingRuleStrategy,
  createRoutingConditionStrategy,
  handlePageDeleted,
  handleAnswerDeleted,
  handleOptionDeleted
});

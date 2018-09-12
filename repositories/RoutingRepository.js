const { head, map } = require("lodash/fp");
const { get, isNil, parseInt } = require("lodash");
const db = require("../db");

const {
  updateRoutingConditionStrategy,
  toggleConditionOptionStrategy,
  getAvailableRoutingDestinations,
  checkRoutingDestinations,
  createRoutingRuleSetStrategy,
  createRoutingRuleStrategy,
  createRoutingConditionStrategy,
  resolveRoutingDestinationStrategy
} = require("./strategies/routingStrategy");

const Routing = require("../db/Routing");
const PageRepository = require("./PageRepository");
const SectionRepository = require("./SectionRepository");

const getRoutingDestinations = async pageId => {
  const logicalDestinations = [
    {
      logicalDestination: "NextPage"
    },
    {
      logicalDestination: "EndOfQuestionnaire"
    }
  ];
  const absoluteDestinations = await db.transaction(trx =>
    getAvailableRoutingDestinations(trx, pageId)
  );
  return {
    logicalDestinations,
    ...absoluteDestinations
  };
};

const checkValidDestination = async (questionPageId, destination) => {
  if (isNil(destination)) {
    throw new Error(`Invalid destination specified for routing rule`);
  }

  const { logicalDestination, absoluteDestination } = destination;
  if (!isNil(logicalDestination) && !isNil(absoluteDestination)) {
    throw new Error("Routing destination cannot be both logical and absolute");
  }

  const availableRoutingDestinations = await getRoutingDestinations(
    questionPageId
  );
  await checkRoutingDestinations(availableRoutingDestinations, destination);
};

function findRoutingRuleSetByQuestionPageId(where = {}) {
  return Routing.findAllRoutingRuleSets()
    .where({ isDeleted: false })
    .where(where)
    .first();
}

function findAllRoutingRules(where = {}) {
  return Routing.findAllRoutingRules()
    .where({ isDeleted: false })
    .where(where);
}

function getRoutingRuleById(id) {
  return Routing.findAllRoutingRules()
    .where({ id, isDeleted: false })
    .first();
}

function getRoutingRuleSetById(id) {
  return Routing.findAllRoutingRuleSets()
    .where({ id: parseInt(id), isDeleted: false })
    .then(head);
}

function findAllRoutingConditions(where = {}) {
  return Routing.findAllRoutingConditions().where(where);
}

function findAllRoutingConditionValues(where = {}) {
  return Routing.findAllRoutingConditionValues()
    .where(where)
    .then(map("optionId"));
}

function createRoutingRuleSet({ questionPageId }) {
  return db.transaction(trx =>
    createRoutingRuleSetStrategy(trx, questionPageId)
  );
}

const deleteRoutingRuleSet = ({ id }) =>
  Routing.updateRoutingRuleSet(id, {
    isDeleted: true
  }).then(head);

async function createRoutingRule(createRoutingRuleInput) {
  return db.transaction(trx =>
    createRoutingRuleStrategy(trx, createRoutingRuleInput)
  );
}

function createRoutingCondition(routingCondition) {
  return db.transaction(trx =>
    createRoutingConditionStrategy(trx, routingCondition)
  );
}

const toggleConditionOption = async ({ conditionId, optionId, checked }) =>
  db.transaction(trx =>
    toggleConditionOptionStrategy(trx, {
      conditionId,
      optionId,
      checked
    })
  );

const updateDestination = async (id, destination) => {
  const { logicalDestination, absoluteDestination } = destination;

  const updatedFields = {
    logicalDestination: get(logicalDestination, "destinationType", null),
    pageId: null,
    sectionId: null
  };

  if (!isNil(absoluteDestination)) {
    const key =
      absoluteDestination.destinationType === "QuestionPage"
        ? "pageId"
        : "sectionId";

    updatedFields[key] = parseInt(absoluteDestination.destinationId);
  }

  return Routing.updateRoutingDestination(id, updatedFields).then(head);
};

async function updateRoutingRuleSet({ id, else: destination }) {
  const routingRuleSet = await getRoutingRuleSetById(id);

  const { questionPageId, routingDestinationId } = routingRuleSet;
  await checkValidDestination(questionPageId, destination);

  await updateDestination(routingDestinationId, destination);

  return routingRuleSet;
}

async function updateRoutingRule({ id, goto: destination }) {
  const routingRule = await getRoutingRuleById(id);
  const routingRuleSet = await getRoutingRuleSetById(
    routingRule.routingRuleSetId
  );

  const { routingDestinationId } = routingRule;

  await checkValidDestination(routingRuleSet.questionPageId, destination);
  await updateDestination(routingDestinationId, destination);

  // No need to update rule since there is not mechanism to change the operation yet
  return routingRule;
}

function updateRoutingCondition({ id, questionPageId, answerId }) {
  return db.transaction(trx =>
    updateRoutingConditionStrategy(trx, { id, questionPageId, answerId })
  );
}

function removeRoutingRule({ id }) {
  return Routing.updateRoutingRule(id, { isDeleted: true }).then(head);
}

function removeRoutingCondition({ id }) {
  return Routing.deleteRoutingCondition(id).then(() => null);
}

function undeleteRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: false }).then(head);
}

function resolveRoutingDestination(sectionId, pageId) {
  if (isNil(sectionId)) {
    return null;
  }

  return db.transaction(trx =>
    resolveRoutingDestinationStrategy(trx, sectionId, pageId)
  );
}

const getRoutingDestination = async routingDestinationId => {
  const destination = await Routing.findRoutingDestinationById(
    routingDestinationId
  );

  if (!destination) {
    return null;
  }

  if (destination.sectionId) {
    const section = await SectionRepository.getById(destination.sectionId);
    return section ? { absoluteDestination: section } : null;
  }

  if (destination.pageId) {
    const page = await PageRepository.getById(destination.pageId);
    return page ? { absoluteDestination: page } : null;
  }

  if (destination.logicalDestination) {
    return { logicalDestination: destination.logicalDestination };
  }
};

Object.assign(module.exports, {
  undeleteRoutingRule,
  removeRoutingCondition,
  removeRoutingRule,
  updateRoutingCondition,
  updateRoutingRule,
  findRoutingRuleSetByQuestionPageId,
  findAllRoutingRules,
  findAllRoutingConditions,
  findAllRoutingConditionValues,
  createRoutingRuleSet,
  createRoutingRule,
  createRoutingCondition,
  toggleConditionOption,
  updateRoutingRuleSet,
  getRoutingDestinations,
  resolveRoutingDestination,
  deleteRoutingRuleSet,
  getRoutingDestination
});

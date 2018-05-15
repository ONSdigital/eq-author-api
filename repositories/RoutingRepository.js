const { head, invert, map } = require("lodash/fp");
const { get } = require("lodash");
const mapping = {
  QuestionPageId: "questionPageId",
  RoutingRuleSetId: "routingRuleSetId",
  RoutingRuleId: "routingRuleId",
  AnswerId: "answerId",
  OptionId: "optionId",
  ConditionId: "conditionId",
  SectionDestination: "sectionDestination",
  PageDestination: "pageDestination"
};
const mapFields = require("../utils/mapFields");
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

const db = require("../db");

const {
  updateConditions,
  createOrRemoveValue
} = require("./strategies/routingStrategy");

const Routing = require("../db/Routing");

function findRoutingRuleSetByQuestionPageId(where = {}) {
  return Routing.findAllRoutingRuleSets()
    .where({ isDeleted: false })
    .where(where)
    .first()
    .then(fromDb);
}

function findAllRoutingRules(where = {}) {
  return Routing.findAllRoutingRules()
    .where({ isDeleted: false })
    .where(where)
    .then(map(fromDb));
}

function findAllRoutingConditions(where = {}) {
  return Routing.findAllRoutingConditions()
    .where(where)
    .then(map(fromDb));
}

function findAllRoutingConditionValues(where = {}) {
  return Routing.findAllRoutingConditionValues().where(where);
}

function insertRoutingRuleSet({ questionPageId, else: destination }) {
  const sectionDestination = get(destination, "sectionId", null);
  const pageDestination = get(destination, "pageId", null);
  return Routing.createRoutingRuleSet(
    toDb({
      questionPageId,
      sectionDestination,
      pageDestination
    })
  )
    .then(head)
    .then(fromDb);
}

function insertRoutingRule({ operation, routingRuleSetId, goto }) {
  const sectionDestination = get(goto, "sectionId", null);
  const pageDestination = get(goto, "pageId", null);
  return Routing.createRoutingRule(
    toDb({
      operation,
      routingRuleSetId,
      sectionDestination,
      pageDestination
    })
  )
    .then(head)
    .then(fromDb);
}

function insertRoutingCondition({ comparator, routingRuleId, answerId }) {
  return Routing.createRoutingCondition(
    toDb({
      comparator,
      routingRuleId,
      answerId
    })
  )
    .then(head)
    .then(fromDb);
}

function toggleConditionValue({ optionId, conditionId, checked }) {
  return db.transaction(trx =>
    createOrRemoveValue(trx, {
      optionId,
      conditionId,
      checked
    }).then(fromDb)
  );
}

function updateRoutingRuleSet({ id, else: destination }) {
  const sectionDestination = get(destination, "sectionId", null);
  const pageDestination = get(destination, "pageId", null);
  return Routing.updateRoutingRuleSet(
    id,
    toDb({
      sectionDestination,
      pageDestination
    })
  )
    .then(head)
    .then(fromDb);
}

function updateRoutingRule({ id, operation, goto }) {
  const sectionDestination = get(goto, "sectionId", null);
  const pageDestination = get(goto, "pageId", null);
  return Routing.updateRoutingRule(
    id,
    toDb({
      operation,
      sectionDestination,
      pageDestination
    })
  )
    .then(head)
    .then(fromDb);
}

function updateRoutingConditionAnswer({ id, answerId }) {
  return db.transaction(trx =>
    updateConditions(trx, { id, answerId }).then(fromDb)
  );
}

function removeRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
}

function removeRoutingCondition(id) {
  return Routing.deleteRoutingCondition(id).then(head);
}

function undeleteRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
}

Object.assign(module.exports, {
  undeleteRoutingRule,
  removeRoutingCondition,
  removeRoutingRule,
  updateRoutingConditionAnswer,
  updateRoutingRule,
  findRoutingRuleSetByQuestionPageId,
  findAllRoutingRules,
  findAllRoutingConditions,
  findAllRoutingConditionValues,
  insertRoutingRuleSet,
  insertRoutingRule,
  insertRoutingCondition,
  toggleConditionValue,
  updateRoutingRuleSet
});

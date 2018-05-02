const { head, invert, map, values } = require("lodash/fp");
const mapping = {
  QuestionPageId: "questionPageId",
  ElseDestination: "elseDestination",
  RuleOperation: "ruleOperation",
  ParentRoutingRuleSet: "parentRoutingRuleSet",
  RuleDestination: "ruleDestination",
  Comparator: "comparator",
  ParentRoutingRule: "parentRoutingRule",
  AnswerId: "answerId",
  OptionId: "optionId",
  ParentCondition: "parentCondition"
};
const mapFields = require("../utils/mapFields");
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

const Routing = require("../db/Routing");

module.exports.findRoutingRuleSetByQuestionPageId = function findRoutingRuleSetByQuestionPageId(
  where = {}
) {
  return Routing.findAllRoutingRuleSets()
    .where({ isDeleted: false })
    .where(where)
    .first()
    .then(fromDb);
};

module.exports.findAllRoutingRules = function findAllRoutingRules(where = {}) {
  return Routing.findAllRoutingRules()
    .where({ isDeleted: false })
    .where(where)
    .then(map(fromDb));
};

module.exports.findAllRoutingConditions = function findAllRoutingConditions(
  where = {}
) {
  return Routing.findAllRoutingConditions()
    .where({ isDeleted: false })
    .where(where)
    .then(map(fromDb));
};

module.exports.findAllRoutingConditionValues = function findAllRoutingConditionValues(
  where = {}
) {
  return Routing.findAllRoutingConditionValues()
    .where({ isDeleted: false })
    .where(where)
    .map(result => result.OptionId);
};

module.exports.getRoutingRuleSet = function getRoutingRuleSet(id) {
  return Routing.findRoutingRuleSetsById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.getRoutingRule = function getRoutingRule(id) {
  return Routing.findRoutingRulesById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.getRoutingCondition = function getRoutingCondition(id) {
  return Routing.findRoutingConditionsById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.getRoutingConditionValue = function getRoutingRoutingConditionValue(
  id
) {
  return Routing.findRoutingRoutingConditionValuesById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insertRoutingRuleSet = function insertRoutingRuleSet({
  elseDestination,
  questionPageId
}) {
  return Answer.createRoutingRuleSet(
    toDb({
      elseDestination,
      questionPageId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.insertRoutingRule = function insertRoutingRule({
  ruleOperation,
  parentRoutingRuleSet,
  ruleDestination
}) {
  return Answer.createRoutingRule(
    toDb({
      ruleOperation,
      parentRoutingRuleSet,
      ruleDestination
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.insertRoutingCondition = function insertRoutingCondition({
  comparator,
  parentRoutingRule,
  answerId
}) {
  return Answer.createRoutingCondition(
    toDb({
      comparator,
      parentRoutingRule,
      answerId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.insertRoutingConditionValue = function insertRoutingConditionValue({
  optionId,
  parentCondition
}) {
  return Answer.createRoutingConditionValue(
    toDb({
      optionId,
      parentCondition
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingRuleSet = function updateRoutingRuleSet({
  id,
  elseDestination,
  questionPageId
}) {
  return Answer.updateRoutingRuleSet(
    toDb(id, {
      elseDestination,
      questionPageId,
      isDeleted
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingRule = function updateRoutingRule({
  id,
  ruleOperation,
  arentRoutingRuleSet,
  ruleDestination
}) {
  return Answer.updateRoutingRule(
    toDb(id, {
      ruleOperation,
      arentRoutingRuleSet,
      ruleDestination
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingCondition = function updateRoutingCondition({
  id,
  comparator,
  parentRoutingRule,
  answerId
}) {
  return Answer.updateRoutingCondition(
    toDb(id, {
      comparator,
      parentRoutingRule,
      answerId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingConditionValue = function updateRoutingConditionValue({
  id,
  optionId,
  parentCondition
}) {
  return Answer.updateRoutingConditionValue(
    toDb(id, {
      optionId,
      parentCondition
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.removeRoutingRuleSet = function removeRoutingRuleSet(id) {
  return Routing.updateRoutingRuleSet(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.removeRoutingRule = function removeRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.removeRoutingCondition = function removeRoutingCondition(id) {
  return Routing.updateRoutingCondition(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.removeRoutingConditionValue = function removeRoutingConditionValue(
  id
) {
  return Routing.updateRoutingConditionValue(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undeleteRoutingRuleSet = function undeleteRoutingRuleSet(id) {
  return Routing.updateRoutingRuleSet(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.undeleteRoutingRule = function undeleteRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.undeleteRoutingCondition = function undeleteRoutingCondition(
  id
) {
  return Routing.updateRoutingCondition(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

module.exports.undeleteRoutingConditionValue = function undeleteRoutingConditionValue(
  id
) {
  return Routing.updateRoutingConditionValue(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

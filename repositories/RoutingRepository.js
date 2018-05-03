const { head, invert, map, values } = require("lodash/fp");
const mapping = {
  QuestionPageId: "questionPageId",
  ElseDestination: "elseDestination",
  RoutingRuleSetId: "routingRuleSetId",
  RuleDestination: "ruleDestination",
  RoutingRuleId: "routingRuleId",
  AnswerId: "answerId",
  OptionId: "optionId",
  ConditionId: "conditionId"
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

// module.exports.getRoutingRuleSet = function getRoutingRuleSet(id) {
//   return Routing.findRoutingRuleSetsById(id)
//     .where({ isDeleted: false })
//     .then(fromDb);
// };

// module.exports.getRoutingRule = function getRoutingRule(id) {
//   return Routing.findRoutingRulesById(id)
//     .where({ isDeleted: false })
//     .then(fromDb);
// };

// module.exports.getRoutingCondition = function getRoutingCondition(id) {
//   return Routing.findRoutingConditionsById(id)
//     .where({ isDeleted: false })
//     .then(fromDb);
// };

// module.exports.getRoutingConditionValue = function getRoutingRoutingConditionValue(
//   id
// ) {
//   return Routing.findRoutingRoutingConditionValuesById(id)
//     .where({ isDeleted: false })
//     .then(fromDb);
// };

module.exports.insertRoutingRuleSet = function insertRoutingRuleSet({
  elseDestination,
  questionPageId
}) {
  return Routing.createRoutingRuleSet(
    toDb({
      elseDestination,
      questionPageId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.insertRoutingRule = function insertRoutingRule({
  operation,
  routingRuleSetId,
  goto = {}
}) {
  return Routing.createRoutingRule(
    toDb({
      operation,
      routingRuleSetId,
      ruleDestination: goto.pageId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.insertRoutingCondition = function insertRoutingCondition({
  comparator,
  routingRuleId,
  answerId
}) {
  return Routing.createRoutingCondition(
    toDb({
      comparator,
      routingRuleId,
      answerId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.toggleConditionValue = function toggleConditionValue({
  optionId,
  conditionId,
  checked
}) {
  return db.transaction(trx =>
    createOrRemoveValue(trx, {
      optionId,
      conditionId,
      checked
    }).then(fromDb)
  );
};

// module.exports.insertRoutingConditionValue = function insertRoutingConditionValue({
//   optionId,
//   parentCondition
// }) {
//   return Routing.createRoutingConditionValue(
//     toDb({
//       optionId,
//       parentCondition
//     })
//   )
//     .then(head)
//     .then(fromDb);
// };

module.exports.updateRoutingRuleSet = function updateRoutingRuleSet({
  id,
  else: { pageId: elseDestination }
}) {
  return Routing.updateRoutingRuleSet(
    id,
    toDb({
      elseDestination
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingRule = function updateRoutingRule({
  id,
  operation,
  goto = {}
}) {
  return Routing.updateRoutingRule(
    id,
    toDb({
      operation,
      ruleDestination: goto.pageId
    })
  )
    .then(head)
    .then(fromDb);
};

module.exports.updateRoutingConditionAnswer = function updateRoutingConditionAnswer({
  id,
  answerId
}) {
  return db.transaction(trx =>
    updateConditions(trx, { id, answerId }).then(fromDb)
  );
};

// module.exports.updateRoutingConditionValue = function updateRoutingConditionValue({
//   id,
//   optionId,
//   parentCondition
// }) {
//   return Routing.updateRoutingConditionValue(
//     toDb(id, {
//       optionId,
//       parentCondition
//     })
//   )
//     .then(head)
//     .then(fromDb);
// };

// module.exports.removeRoutingRuleSet = function removeRoutingRuleSet(id) {
//   return Routing.updateRoutingRuleSet(id, { isDeleted: true })
//     .then(head)
//     .then(fromDb);
// };

module.exports.removeRoutingRule = function removeRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

const debug = x => {
  debugger;
  return x;
};

module.exports.removeRoutingCondition = function removeRoutingCondition(id) {
  return Routing.deleteRoutingCondition(id).then(head);
};

// module.exports.removeRoutingConditionValue = function removeRoutingConditionValue(
//   id
// ) {
//   return Routing.updateRoutingConditionValue(id, { isDeleted: true })
//     .then(head)
//     .then(fromDb);
// };

// module.exports.undeleteRoutingRuleSet = function undeleteRoutingRuleSet(id) {
//   return Routing.updateRoutingRuleSet(id, { isDeleted: false })
//     .then(head)
//     .then(fromDb);
// };

module.exports.undeleteRoutingRule = function undeleteRoutingRule(id) {
  return Routing.updateRoutingRule(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

// module.exports.undeleteRoutingCondition = function undeleteRoutingCondition(
//   id
// ) {
//   return Routing.updateRoutingCondition(id, { isDeleted: false })
//     .then(head)
//     .then(fromDb);
// };

// module.exports.undeleteRoutingConditionValue = function undeleteRoutingConditionValue(
//   id
// ) {
//   return Routing.updateRoutingConditionValue(id, { isDeleted: false })
//     .then(head)
//     .then(fromDb);
// };

const db = require("./");

function RoutingRuleSet() {
  return db("Routing_RuleSets");
}

function RoutingRule() {
  return db("Routing_Rules");
}

function RoutingCondition() {
  return db("Routing_Conditions");
}

function RoutingConditionValue() {
  return db("Routing_ConditionValues");
}

module.exports.findAllRoutingRuleSets = function findAllRoutingRuleSets() {
  return RoutingRuleSet().select();
};

module.exports.findAllRoutingRules = function findAllRoutingRules() {
  return RoutingRule().select();
};

module.exports.findAllRoutingConditions = function findAllRoutingConditions() {
  return RoutingRuleSet().select();
};

module.exports.findAllRoutingConditionValues = function indAllRoutingConditionValues() {
  return RoutingRuleSet().select();
};

module.exports.findRoutingRuleSetsById = function findRoutingRuleSetsById(id) {
  return RoutingRuleSet()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.findRoutingRulesById = function findRoutingRulesById(id) {
  return RoutingRule()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.findRoutingConditionsById = function findRoutingConditionsById(
  id
) {
  return RoutingCondition()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.findRoutingConditionValuesById = function findRoutingConditionValuesById(
  id
) {
  return RoutingConditionValue()
    .where("id", parseInt(id, 10))
    .first();
};

module.exports.createRoutingRuleSet = function createRoutingRuleSet(rule) {
  return RoutingRuleSet()
    .insert(rule)
    .returning("*")
    .then(head);
};

module.exports.createRoutingRule = function createRoutingRule(rule) {
  return RoutingRule()
    .insert(rule)
    .returning("*")
    .then(head);
};

module.exports.createRoutingCondition = function createRoutingCondition(rule) {
  return RoutingCondition()
    .insert(rule)
    .returning("*")
    .then(head);
};

module.exports.createRoutingConditionValue = function createRoutingConditionValue(
  rule
) {
  return createRoutingConditionValue()
    .insert(rule)
    .returning("*")
    .then(head);
};

module.exports.updateRoutingRuleSet = function updateRoutingRuleSet(
  id,
  updates
) {
  return RoutingRuleSet()
    .where("id", id)
    .update(updates)
    .returning("*");
};

module.exports.updateRoutingRule = function updateRoutingRule(id, updates) {
  return RoutingRule()
    .where("id", id)
    .update(updates)
    .returning("*");
};

module.exports.updateRoutingCondition = function updateRoutingCondition(
  id,
  updates
) {
  return RoutingCondition()
    .where("id", id)
    .update(updates)
    .returning("*");
};

module.exports.updateRoutingConditionValue = function updateRoutingConditionValue(
  id,
  updates
) {
  return RoutingConditionValue()
    .where("id", id)
    .update(updates)
    .returning("*");
};

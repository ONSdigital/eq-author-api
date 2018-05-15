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

function findAllRoutingRuleSets() {
  return RoutingRuleSet().select();
}

function findAllRoutingRules() {
  return RoutingRule().select();
}
function findAllRoutingConditions() {
  return RoutingCondition().select();
}
function findAllRoutingConditionValues() {
  return RoutingConditionValue().select();
}

function findRoutingRuleSetsById(id) {
  return RoutingRuleSet()
    .where("id", parseInt(id, 10))
    .first();
}
function findRoutingRulesById(id) {
  return RoutingRule()
    .select()
    .where("id", parseInt(id, 10))
    .first();
}

function findRoutingConditionValuesById(id) {
  return RoutingConditionValue()
    .where("id", parseInt(id, 10))
    .first();
}

function createRoutingRuleSet(rule) {
  return RoutingRuleSet()
    .insert(rule)
    .returning("*");
}

function createRoutingRule(rule) {
  return RoutingRule()
    .insert(rule)
    .returning("*");
}

function createRoutingCondition(rule) {
  return RoutingCondition()
    .insert(rule)
    .returning("*");
}

function createRoutingConditionValue(rule) {
  return createRoutingConditionValue()
    .insert(rule)
    .returning("*");
}

function updateRoutingRuleSet(id, updates) {
  return RoutingRuleSet()
    .where("id", id)
    .update(updates)
    .returning("*");
}

function updateRoutingRule(id, updates) {
  return RoutingRule()
    .where("id", id)
    .update(updates)
    .returning("*");
}

function updateRoutingCondition(id, updates) {
  return RoutingCondition()
    .where("id", id)
    .update(updates)
    .returning("*");
}

function updateRoutingConditionValue(id, updates) {
  return RoutingConditionValue()
    .where("id", id)
    .update(updates)
    .returning("*");
}

function deleteRoutingCondition(id) {
  return RoutingCondition()
    .where({ id })
    .returning("*")
    .del();
}

Object.assign(module.exports, {
  findAllRoutingRuleSets,
  findAllRoutingRules,
  findAllRoutingConditions,
  findAllRoutingConditionValues,
  findRoutingRuleSetsById,
  findRoutingRulesById,
  findRoutingConditionValuesById,
  createRoutingRuleSet,
  createRoutingRule,
  createRoutingCondition,
  createRoutingConditionValue,
  updateRoutingRuleSet,
  updateRoutingRule,
  updateRoutingCondition,
  updateRoutingConditionValue,
  deleteRoutingCondition
});

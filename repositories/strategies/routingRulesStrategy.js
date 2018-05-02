const { head, isNil } = require("lodash/fp");

const createRoutingRuleSet = async (
  trx,
  { questionPageId, elseDestination }
) => {
  const existingRoutingRuleSet = findRoutingRuleSet(trx, id);

  if (!isNil(existingRoutingRuleSet)) {
    throw new Error(
      "Cannot add a second rule set, please delete the existing one first."
    );
    return;
  }

  trx("Routing_RuleSets")
    .insert(
      toDb({
        questionPageId,
        elseDestination
      })
    )
    .returning("*")
    .then(head);
};

const createRoutingRule = async (
  trx,
  { ruleOperation, parentRoutingRuleSet, ruleDestination }
) => {
  trx("Routing_Rules")
    .insert(
      toDb({
        ruleOperation,
        parentRoutingRuleSet,
        ruleDestination
      })
    )
    .returning("*")
    .then(head);
};

const createRoutingCondition = async (
  trx,
  { comparator, parentRoutingRule, answerId }
) => {
  trx("Routing_Conditions")
    .insert(
      toDb({
        comparator,
        parentRoutingRule,
        AnswerId
      })
    )
    .returning("*")
    .then(head);
};

const createRoutingConditionValue = async (
  trx,
  { optionId, parentCondition }
) => {
  trx("Routing_ConditionValues")
    .insert(
      toDb({
        ruleOperation,
        parentRoutingRuleSet,
        ruleDestination
      })
    )
    .returning("*")
    .then(head);
};

const deleteRoutingRuleSet = async (trx, { id }) => {
  trx("Routing_RuleSets")
    .where("id", id)
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head);
};

const deleteRoutingRule = async (trx, { id }) => {
  trx("Routing_Rules")
    .where("id", id)
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head);
};

const deleteRoutingCondition = async (trx, { id }) => {
  trx("Routing_Conditions")
    .where("id", id)
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head);
};

const deleteRoutingConditionValue = async (trx, { id }) => {
  trx("Routing_RuleConditionValues")
    .where("id", id)
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head);
};

const findRoutingRuleSet = async (trx, { id }) => {
  trx("Routing_RuleSets")
    .where({ questionPageId: id, isDeleted: false })
    .first();
};

const findRoutingRule = async (trx, { id }) => {
  trx("Routing_Rules")
    .where({ parentRoutingRuleSet: id, isDeleted: false })
    .returning("*");
};
const findRoutingCondition = async (trx, { id }) => {
  trx("Routing_Conditions")
    .select()
    .where({ parentRoutingRule: id, isDeleted: false });
};

const findRoutingConditionValue = async (trx, { id }) => {
  trx("Routing_ConditionValues")
    .where({ parentCondition: id, isDeleted: false })
    .returning("*");
};

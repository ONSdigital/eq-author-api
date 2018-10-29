const { head } = require("lodash");
const { selectData, duplicateRecord } = require("./utils");

const duplicateConditionValue = (trx, value, condition, references) =>
  duplicateRecord(trx, "Routing_ConditionValues", value, {
    conditionId: condition.id,
    optionId: references.options[value.optionId] || value.optionId
  });

const duplicateCondition = async (trx, condition, rule, references) => {
  const duplicatedCondition = await duplicateRecord(
    trx,
    "Routing_Conditions",
    condition,
    {
      routingRuleId: rule.id,
      questionPageId:
        references.pages[condition.questionPageId] || condition.questionPageId,
      answerId: references.answers[condition.answerId] || condition.answerId
    }
  );

  const valuesToDuplicate = await selectData(
    trx,
    "Routing_ConditionValues",
    "*",
    {
      conditionId: condition.id
    }
  );

  await Promise.all(
    valuesToDuplicate.map(value =>
      duplicateConditionValue(trx, value, duplicatedCondition, references)
    )
  );
};

const duplicateDestination = (trx, destination, references) => {
  return duplicateRecord(trx, "Routing_Destinations", destination, {
    pageId: references.pages[destination.pageId] || destination.pageId,
    sectionId:
      references.sections[destination.sectionId] || destination.sectionId
  });
};

const duplicateRule = async (trx, rule, ruleSet, references) => {
  const destination = await selectData(trx, "Routing_Destinations", "*", {
    id: rule.routingDestinationId
  }).then(head);

  const duplicatedDestination = await duplicateDestination(
    trx,
    destination,
    references
  );

  const duplicatedRule = await duplicateRecord(trx, "Routing_Rules", rule, {
    routingRuleSetId: ruleSet.id,
    routingDestinationId: duplicatedDestination.id
  });

  const conditionsToDuplicate = await selectData(
    trx,
    "Routing_Conditions",
    "*",
    {
      routingRuleId: rule.id
    }
  );

  await Promise.all(
    conditionsToDuplicate.map(condition =>
      duplicateCondition(trx, condition, duplicatedRule, references)
    )
  );

  return duplicatedRule;
};

const duplicateRuleSet = async (trx, ruleSet, references) => {
  const elseDestination = await selectData(trx, "Routing_Destinations", "*", {
    id: ruleSet.routingDestinationId
  }).then(head);

  const duplicatedElseDestination = await duplicateDestination(
    trx,
    elseDestination,
    references
  );

  const duplicatedRuleSet = await duplicateRecord(
    trx,
    "Routing_RuleSets",
    ruleSet,
    {
      routingDestinationId: duplicatedElseDestination.id,
      questionPageId: references.pages[ruleSet.questionPageId]
    }
  );

  const rulesToDuplicate = await selectData(trx, "Routing_Rules", "*", {
    routingRuleSetId: ruleSet.id,
    isDeleted: false
  });

  await Promise.all(
    rulesToDuplicate.map(rule =>
      duplicateRule(trx, rule, duplicatedRuleSet, references)
    )
  );

  return duplicatedRuleSet;
};

const duplicateRouting = async (trx, pagesWithRouting, references) =>
  Promise.all(
    pagesWithRouting.map(({ ruleSet }) =>
      duplicateRuleSet(trx, ruleSet, references)
    )
  );

module.exports = duplicateRouting;

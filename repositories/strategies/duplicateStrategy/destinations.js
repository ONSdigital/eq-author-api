const { omit, get } = require("lodash/fp");

const getRuleSetDestinations = async (trx, references) => {
  if (!references.routingRuleSets) {
    return [];
  }
  return trx
    .select("id", "routingDestinationId")
    .from("Routing_RuleSets")
    .whereIn("id", Object.values(references.routingRuleSets))
    .andWhere("isDeleted", false);
};

const updateRuleSets = async (trx, ruleSets, destLookup) => {
  for (let i = 0; i < ruleSets.length; ++i) {
    const { id, routingDestinationId } = ruleSets[i];
    await trx
      .table("Routing_RuleSets")
      .where({ id })
      .update({
        routingDestinationId: destLookup[routingDestinationId]
      });
  }
};

const getRuleDestinations = async (trx, references) => {
  if (!references.rules) {
    return [];
  }
  return trx
    .select("id", "routingDestinationId")
    .from("Routing_Rules")
    .whereIn("id", Object.values(references.routingRules))
    .andWhere("isDeleted", false);
};

const updateRules = async (trx, rules, destLookup) => {
  for (let i = 0; i < rules.length; ++i) {
    const { id, routingDestinationId } = rules[i];
    await trx
      .table("Routing_Rules")
      .where({ id })
      .update({
        routingDestinationId: destLookup[routingDestinationId]
      });
  }
};

const duplicateDestinations = async (trx, references) => {
  const [ruleSets, rules] = await Promise.all([
    getRuleSetDestinations(trx, references),
    getRuleDestinations(trx, references)
  ]);

  const allIds = [...ruleSets, ...rules].map(get("routingDestinationId"));

  const destinations = await trx
    .select("*")
    .from("Routing_Destinations")
    .whereIn("id", allIds);

  const updatedDestinations = destinations.map(dest => ({
    ...omit("id")(dest),
    pageId: references.pages[dest.pageId] || dest.pageId,
    sectionId: references.sections[dest.sectionId] || dest.sectionId
  }));

  const newDestinations = await trx
    .insert(updatedDestinations)
    .into("Routing_Destinations")
    .returning("id");

  const oldDestIdToNewDestId = destinations.reduce(
    (map, { id }, index) => ({ ...map, [id]: newDestinations[index] }),
    {}
  );

  return Promise.all([
    updateRuleSets(trx, ruleSets, oldDestIdToNewDestId),
    updateRules(trx, rules, oldDestIdToNewDestId)
  ]);
};

module.exports = duplicateDestinations;

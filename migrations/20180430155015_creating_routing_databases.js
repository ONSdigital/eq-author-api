exports.up = async function(knex, Promise) {
  await createRoutingRuleSetTable(knex);
  await createOperationsTable(knex);
  await createRoutingRuleTable(knex);
  await createComparatorTable(knex);
  await createRoutingConditionTable(knex);
  await createRoutingConditionValuesTable(knex);
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable("Routing_ConditionValues");
  await knex.schema.dropTable("Routing_Conditions");
  await knex.schema.dropTable("Routing_Comparators");
  await knex.schema.dropTable("Routing_Rules");
  await knex.schema.dropTable("Routing_Operations");
  await knex.schema.dropTable("Routing_RuleSets");
};

const createRoutingRuleSetTable = async knex => {
  return knex.schema.createTable("Routing_RuleSets", function(table) {
    table.increments();

    table
      .integer("QuestionPageId")
      .unsigned()
      .references("id")
      .inTable("Pages")
      .onDelete("CASCADE");

    table
      .integer("ElseDestination")
      .unsigned()
      .references("id")
      .inTable("Pages");

    table
      .boolean("isDeleted")
      .notNull()
      .defaultTo(false);
  });
};

const createOperationsTable = async knex => {
  return knex.schema
    .createTable("Routing_Operations", function(table) {
      table.increments();
      table.enum("operation", ["And", "Or"]).notNullable();
    })
    .then(() => {
      return knex("Routing_Operations").insert([
        { operation: "And" },
        { operation: "Or" }
      ]);
    });
};

const createRoutingRuleTable = async knex => {
  return knex.schema.createTable("Routing_Rules", function(table) {
    table.increments();

    table
      .integer("RuleOperation")
      .unsigned()
      .references("id")
      .inTable("Routing_Operations");

    table
      .integer("ParentRoutingRuleSet")
      .unsigned()
      .references("id")
      .inTable("Routing_RuleSets")
      .onDelete("CASCADE");

    table
      .integer("RuleDestination")
      .unsigned()
      .references("id")
      .inTable("Pages")
      .onDelete("CASCADE");

    table
      .boolean("isDeleted")
      .notNull()
      .defaultTo(false);
  });
};

const createComparatorTable = async knex => {
  return knex.schema
    .createTable("Routing_Comparators", function(table) {
      table.increments();

      table.enum("comparator", ["Equal", "NotEqual"]).notNullable();
    })
    .then(() => {
      return knex("Routing_Comparators").insert([
        { comparator: "Equal" },
        { comparator: "NotEqual" }
      ]);
    });
};

const createRoutingConditionTable = async knex => {
  return knex.schema.createTable("Routing_Conditions", function(table) {
    table.increments();

    table
      .integer("Comparator")
      .unsigned()
      .references("id")
      .inTable("Routing_Comparators");

    table
      .integer("ParentRoutingRule")
      .unsigned()
      .references("id")
      .inTable("Routing_Rules")
      .onDelete("CASCADE");

    table
      .integer("AnswerId")
      .unsigned()
      .references("id")
      .inTable("Answers")
      .onDelete("CASCADE");

    table
      .boolean("isDeleted")
      .notNull()
      .defaultTo(false);
  });
};

const createRoutingConditionValuesTable = async knex => {
  return knex.schema.createTable("Routing_ConditionValues", function(table) {
    table.increments();

    table
      .integer("OptionId")
      .unsigned()
      .references("id")
      .inTable("Options")
      .onDelete("CASCADE");

    table
      .integer("ParentCondition")
      .unsigned()
      .references("id")
      .inTable("Routing_Conditions")
      .onDelete("CASCADE");

    table
      .boolean("isDeleted")
      .notNull()
      .defaultTo(false);
  });
};

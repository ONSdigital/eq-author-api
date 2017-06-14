const schema = require("../../schema");
const { graphql } = require("graphql");

async function executeQuery(query) {
  const result = await graphql(schema, query, {}, {});
  return result.data;
}

module.exports = executeQuery;
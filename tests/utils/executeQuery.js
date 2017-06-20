const schema = require("../../schema");
const { graphql } = require("graphql");

async function executeQuery(query, args = {}) {
  const result = await graphql(schema, query, {}, {}, args);
  console.log(result);
  return result.data;
}

module.exports = executeQuery;
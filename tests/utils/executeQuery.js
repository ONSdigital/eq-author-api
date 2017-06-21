const schema = require("../../schema");
const { graphql } = require("graphql");

async function executeQuery(query, args = {}, ctx = {}) {
  return await graphql(schema, query, {}, ctx, args);
}

module.exports = executeQuery;
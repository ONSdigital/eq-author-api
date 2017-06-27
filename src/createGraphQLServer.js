var graphqlHTTP = require("express-graphql");
const graphqlExpress = require('graphql-server-express').graphqlExpress;
var schema = require("./schema");

var {
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT,
  GRAPHIQL_PRETTY } = require('./settings').graphiql;

module.exports = () => {
  const ENV = process.env.NODE_ENV || 'production';

  let result;
  if (ENV === 'production') {
    result = graphqlExpress({ schema: schema });
  } else {
    result = graphqlHTTP({
    schema: schema,
    pretty: GRAPHIQL_PRETTY,
    graphiql: GRAPHIQL_ENABLED,
  });
  }

  return result;
}

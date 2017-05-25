require('dotenv').config()

var scheme = process.env.SCHEME || 'http://';
var host = process.env.HOST || 'localhost';
var port = process.env.PORT || 4000;
var graphiql_enabled = process.env.GRAPHIQL_ENABLED || true;
var graphiql_endpoint = process.env.GRAPHIQL_ENDPOINT || '/graphiql';

module.exports = {
  scheme,
  host,
  port,
  graphiql_enabled,
  graphiql_endpoint
}

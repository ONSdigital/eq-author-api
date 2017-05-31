require('dotenv').config()

var express = {
  port: process.env.PORT || 4000,
  url: (process.env.SCHEME || 'http://') + (process.env.HOST || 'localhost') + ':' + (process.env.PORT || 4000)
};

var graphiql = {
  enabled: process.env.GRAPHIQL_ENABLED || true,
  endpoint: process.env.GRAPHIQL_ENDPOINT || '/graphiql',
  pretty: process.env.PRETTY_PRINT_GRAPHQL || true
};

var db = {
  DATABASE: process.env.DATABASE,
  USERNAME: process.env.DATABASE_USERNAME,
  PASSWORD: process.env.DATABASE_PASSWORD,
  HOST: process.env.DB_HOST,
  DIALECT: process.env.DB_DIALECT
};

module.exports = {
  express,
  graphiql,
  db
}

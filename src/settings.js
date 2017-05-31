require('dotenv').config()

var express = {
  port: process.env.PORT || 4000,
  url: process.env.SCHEME || 'http://' + process.env.HOST || 'localhost' + ':' + process.env.PORT || 4000
};

var graphiql = {
  enabled: process.env.GRAPHIQL_ENABLED || true,
  endpoint: process.env.GRAPHIQL_ENDPOINT || '/graphiql',
  pretty: process.env.PRETTY_PRINT_GRAPHQL || true
};

var db = {
  DATABASE: process.env.DATABASE || 'postgres',
  USERNAME: process.env.DATABASE_USERNAME || 'postgres',
  PASSWORD: process.env.DATABASE_PASSWORD || 'mysecretpassword',
  HOST: process.env.DB_HOST = 'db',
  DIALECT: process.env.DB_DIALECT = 'postgres'
};

module.exports = {
  express,
  graphiql,
  db
}

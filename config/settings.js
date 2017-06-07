require('dotenv').config()

const express = {
  EXPRESS_PORT: process.env.PORT || 4000,
  EXPRESS_URL: (process.env.SCHEME || 'http://') + (process.env.HOST || 'localhost') + ':' + (process.env.PORT || 4000)
};

const graphiql = {
  GRAPHIQL_ENABLED: process.env.GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT: process.env.GRAPHIQL_ENDPOINT || '/graphiql',
  GRAPHIQL_PRETTY: process.env.GRAPHIQL_PRETTY
};

module.exports = {
  express,
  graphiql
};
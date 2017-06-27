require('dotenv').config();

const {
  PORT = 4000,
  SCHEME = "http://",
  HOST = "localhost",
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT = "/graphiql",
  GRAPHIQL_PRETTY
} = process.env;

module.exports = {
  EXPRESS_PORT: PORT,
  EXPRESS_URL: SCHEME + HOST + ':' + PORT,
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT,
  GRAPHIQL_PRETTY
};

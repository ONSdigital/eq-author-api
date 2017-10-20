require("dotenv").config();

const {
  PORT = 4000,
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT = "/graphiql",
  GRAPHIQL_PRETTY
} = process.env;

module.exports = {
  PORT,
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT,
  GRAPHIQL_PRETTY
};

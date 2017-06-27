const express = require("express");
const graphqlHTTP = require("express-graphql");
const colors = require("colors");
const cors = require("cors");

const schema = require("./schema");
const repositories = require("./repositories");
const {
  EXPRESS_URL,
  EXPRESS_PORT,
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT,
  GRAPHIQL_PRETTY
} = require('./config/settings');

var app = express();
app.use(GRAPHIQL_ENDPOINT,
  cors(),
  graphqlHTTP({
    schema: schema,
    pretty: GRAPHIQL_PRETTY,
    graphiql: GRAPHIQL_ENABLED,
    context: { repositories }
  })
);


console.log('Starting server...');

app.listen(EXPRESS_PORT, () => {
  console.log(
    colors.green('eq-author-api'),
    'is running at',
    colors.yellow(EXPRESS_URL + GRAPHIQL_ENDPOINT)
  );
});

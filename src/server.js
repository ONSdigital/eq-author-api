const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./schema");
const colors = require("colors");
const cors = require("cors");
const models = require("../models");
const settings = require('./settings');

const {
  express : {
    EXPRESS_URL,
    EXPRESS_PORT
  },
  graphiql : {
    GRAPHIQL_ENABLED,
    GRAPHIQL_ENDPOINT,
    GRAPHIQL_PRETTY
  }
} = settings;


var app = express();
app.use(GRAPHIQL_ENDPOINT,
  cors(),
  graphqlHTTP({
  schema: schema,
  pretty: GRAPHIQL_PRETTY,
  graphiql: GRAPHIQL_ENABLED,
}));


console.log('Starting server...');

models.sequelize.sync().then(() => {
  app.listen(EXPRESS_PORT, () => {
    console.log(colors.green('eq-author-api'), 'is running at', colors.yellow(EXPRESS_URL + GRAPHIQL_ENDPOINT))
  });
});

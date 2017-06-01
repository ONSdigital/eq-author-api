var express = require("express");
var graphqlHTTP = require("express-graphql");
var schema = require("./schema");
var colors = require("colors");
const cors = require("cors");
var { EXPRESS_URL, EXPRESS_PORT } = require('./settings').express
var {
   GRAPHIQL_ENABLED,
   GRAPHIQL_ENDPOINT,
   GRAPHIQL_PRETTY
 } = require('./settings').graphiql

var express = require('express');
var graphqlHTTP = require('express-graphql');
var schema = require('./schema');
var colors = require('colors');


var app = express();
app.use(GRAPHIQL_ENDPOINT,
  cors(),
  graphqlHTTP({
  schema: schema,
  pretty: GRAPHIQL_PRETTY,
  graphiql: GRAPHIQL_ENABLED,
}));

console.log('Starting server...')
app.listen(EXPRESS_PORT, () => {
  console.log(colors.green('eq-author-api'),
    'is running at',
    colors.yellow(EXPRESS_URL + GRAPHIQL_ENDPOINT))
});

const ENV = process.env.NODE_ENV || 'production'

var express = require("express");
var graphqlHTTP = require("express-graphql");
const graphqlExpress = require('graphql-server-express').graphqlExpress;
var schema = require("./schema");
var colors = require("colors");
const cors = require("cors");
var { EXPRESS_URL, EXPRESS_PORT } = require('./settings').express
var {
  GRAPHIQL_ENABLED,
  GRAPHIQL_ENDPOINT,
  GRAPHIQL_PRETTY } = require('./settings').graphiql;

var app = express();
app.use(GRAPHIQL_ENDPOINT,
  cors(),
  graphqlHTTP({
  schema: schema,
  pretty: GRAPHIQL_PRETTY,
  graphiql: GRAPHIQL_ENABLED,
}));

app.use('/graphql', cors(), graphqlExpress({ schema: schema }))

app.use('/mode', (req, res) => {
  res.send(process.env);
})

console.log('Starting server...')
app.listen(EXPRESS_PORT, () => {
  console.log(colors.green('eq-author-api'),
    'is running at',
    colors.yellow(EXPRESS_URL + GRAPHIQL_ENDPOINT))
});

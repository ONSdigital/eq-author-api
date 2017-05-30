
var express = require('express');
var graphqlHTTP = require('express-graphql');
var schema = require('./schema');
var colors = require('colors');
var { url, port } = require('./settings').express
var { endpoint, enabled, pretty } = require('./settings').graphiql

var app = express();
app.use(endpoint, graphqlHTTP({
  schema: schema,
  pretty: pretty,
  graphiql: enabled,
}));

console.log('Starting server...')
app.listen(port, () => {
  console.log(colors.green('eq-author-api'),
    'is running at',
    colors.yellow(url + endpoint))
});

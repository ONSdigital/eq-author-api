
var express = require('express');
var graphqlHTTP = require('express-graphql');
var schema = require('./schema');
var colors = require('colors');
var { scheme, host, port, graphiql_enabled, graphiql_endpoint } = require('./settings')

/*
* The root object defines all the data lookup functions.
*/
var root = { hello: () => 'Hello world!' };

var app = express();
app.use(graphiql_endpoint, graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: graphiql_enabled,
}));

console.log('Starting server...')
app.listen(port, () => {
  console.log(colors.green('eq-author-api'),
    'is running at',
    colors.yellow(scheme + host + ':' + port + graphiql_endpoint))
});

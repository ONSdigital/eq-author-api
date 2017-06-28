const ENV = process.env.NODE_ENV || 'production'

var express = require("express");
const graphqlExpress = require('graphql-server-express').graphqlExpress;
const graphiqlExpress = require('graphql-server-express').graphiqlExpress;
var schema = require("./schema");
var colors = require("colors");
const cors = require("cors");
const bodyParser = require('body-parser')

var { EXPRESS_URL, EXPRESS_PORT } = require('./settings').express;
var { GRAPHIQL_ENDPOINT } = require('./settings').graphiql;

var app = express();

app.use('/graphql', cors(), bodyParser.json(), graphqlExpress({schema: schema}))

if (process.env.NODE_ENV === 'development'){
  app.use('/graphiql', cors(), graphiqlExpress({ endpointURL: '/graphql' }))
}

console.log('Starting server...')
app.listen(EXPRESS_PORT, () => {
  console.log(colors.green('eq-author-api'),
    'is running at',
    colors.yellow(EXPRESS_URL + GRAPHIQL_ENDPOINT))
});

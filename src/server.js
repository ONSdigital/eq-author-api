const express = require("express");
const { graphqlExpress, graphiqlExpress } = require("graphql-server-express");
const schema = require("./schema");
const colors = require("colors");
const cors = require("cors");
const bodyParser = require('body-parser')

const { EXPRESS_URL, EXPRESS_PORT } = require('./settings').express;
const { GRAPHIQL_ENDPOINT } = require('./settings').graphiql;

const app = express();

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

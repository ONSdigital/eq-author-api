var { buildSchema } = require('graphql');

/**
* This is where all the GraphQL schema types will be defined.
* The finished schema is likely to include things like Pages, Questions, Answers etc.
*/
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

module.exports = schema

const { GraphQLSchema } = require("graphql");
const query = require("./queries");
const mutation = require("./mutations");

/**
* This is where all the GraphQL schema types will be defined.
* The finished schema is likely to include things like Pages, Questions, Answers etc.
*/
module.exports = new GraphQLSchema({
  query,
  mutation
});
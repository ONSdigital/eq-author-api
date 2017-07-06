const { GraphQLSchema } = require("graphql");
const query = require("./queries");
const mutation = require("./mutations");
const graphqlTools = require('graphql-tools');
const typeDefs = require('./typeDefinitions');
const resolvers = require('./resolvers');

/**
* This is where all the GraphQL schema types will be defined.
*/
module.exports = graphqlTools.makeExecutableSchema({
    typeDefs,
    resolvers
});
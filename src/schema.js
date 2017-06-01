var {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");

// Import the Database connection.
var Db = require("./db");

// Define the GraphQL types for the schema.
// Eventually these might include things like Pages, Questions, Answers etc.
var Message = new GraphQLObjectType({
  name: "Message",
  description: "This represents a message",
  fields: () => {
    return {
      id: {
        type: GraphQLInt,
        resolve(message) {
          return message.id;
        }
      },
      text: {
        type: GraphQLString,
        resolve(message) {
          return message.text;
        }
      }
    };
  }
});

// Define a root query.
// Think of this as public API for querying
var Query = new GraphQLObjectType({
  name: "App",
  description: "This is the root query",
  fields: () => {
    return {
      hello: {
        type: new GraphQLList(Message),
        resolve(root, args) {
          return Db.models.message.findAll({ where: args });
        }
      }
    };
  }
});

// Define a root mutation.
// Think of this as public API for mutation
var Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Functions to mutate stuff",
  fields() {
    return {
      // In this case I'm definining a single mutation object that adds a new
      // message.
      addMessage: {
        type: Message,
        args: {
          text: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve(_, args) {
          // Call the create method provided by sequelize
          return Db.models.message.create({
            text: args.text
          });
        }
      }
    };
  }
});

/**
* This is where all the GraphQL schema types will be defined.
* The finished schema is likely to include things like Pages, Questions, Answers etc.
*/
var schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

// Export the schema
module.exports = schema;

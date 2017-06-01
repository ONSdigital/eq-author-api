const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

// Import the Database connection.
const Db = require('./db')

// Define the GraphQL types for the schema.
// Eventually these might include things like Pages, Questions, Answers etc.
const message = new GraphQLObjectType({
  name: 'Message',
  description: 'This represents a message',
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
    }
  }
});

// Define a root query.
// Think of this as public API for querying
const query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is the root query',
  fields: () => {
    return {
      hello: {
        type: new GraphQLList(message),
        resolve(root, args) {
          return Db.models.message.findAll({where: args});
        }
      }
    }
  }
});

// Define a root mutation.
// Think of this as public API for mutation
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Functions to mutate stuff',
  fields() {
    return {
      // In this case I'm definining a single mutation object that adds a new
      // message.
      addMessage: {
        type: message,
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
      },
      updateMessage: {
        type: message,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          text: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve(_, { text, id }) {
          return Db.models.message
            .update(
              { text },
              {
                where : { id }
              }
            )
            .then(() => Db.models.message.findById(id))
            .catch(err => console.log(err))
        }
      },
      deleteMessage: {
        type: message,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve(_, {id}) {
          return Db.models.message.destroy({where: {id}})
            .then(result => result)
            .catch(err => console.log(err));
        }
      }
    }
  }
});

/**
* This is where all the GraphQL schema types will be defined.
* The finished schema is likely to include things like Pages, Questions, Answers etc.
*/
const schema = new GraphQLSchema({
  query,
  mutation
});

// Export the schema
module.exports = schema

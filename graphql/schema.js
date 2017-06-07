const { get } = require("lodash/fp");
const models = require("../models");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} = require("graphql");

const Questionnaire = new GraphQLObjectType({
  name : "Questionnaire",
  description : "A Questionnaire",

  fields: {

    id : {
      type: GraphQLID,
      resolve: get("id")
    },

    title : {
      type: GraphQLString,
      resole: get("title")
    },

    description : {
      type: GraphQLString,
      resolve: get("description")
    },

    theme : {
      type: GraphQLString,
      resolve: get("theme")
    },

    legalBasis : {
      type: GraphQLString,
      resolve: get("legalBasis")
    },

    navigation : {
      type: GraphQLBoolean,
      resolve: get("navigation")
    }

  }
});

// Define a root query.
// Think of this as public API for querying

const query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is the root query',

  fields: {
    questionnaires : {
      type : new GraphQLList(Questionnaire),
      resolve(root, args) {
        return models.Questionnaire.all();
      }
    },

    questionnaire : {
      type: Questionnaire,
      reslolve(root, { id }) {
        return models.Questionnaire.findById(id);
      }
    }
  }
});

// Define a root mutation.
// Think of this as public API for mutation
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Functions to mutate stuff',
  fields: {
    createQuestionnaire: {
      type: Questionnaire,

      args : {
        title : {
          type : new GraphQLNonNull(GraphQLString)
        },
        description : {
          type : new GraphQLNonNull(GraphQLString)
        },
        theme : {
          type : new GraphQLNonNull(GraphQLString)
        },
        legalBasis : {
          type : new GraphQLNonNull(GraphQLString)
        },
        navigation : {
          type : GraphQLBoolean
        }
      },

      resolve(source, args) {
        const { title, description, theme, legalBasis, navigation } = args;

        return models.Questionnaire.create({
          title,
          description,
          theme,
          legalBasis,
          navigation
        });
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
module.exports = schema;

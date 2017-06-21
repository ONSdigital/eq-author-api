const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean
} = require("graphql");
const { Questionnaire } = require("../types");

module.exports = {
  type: Questionnaire,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    theme : {
      type : new GraphQLNonNull(GraphQLString)
    },
    legalBasis : {
      type : new GraphQLNonNull(GraphQLString)
    },
    navigation : {
      type : GraphQLBoolean
    },
    surveyId : {
      type : new GraphQLNonNull(GraphQLString)
    }
  },

  resolve(root, args, ctx) {
    return ctx.repositories.Questionnaire.insert(args);
  }
};
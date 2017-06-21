const { Questionnaire } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt
} = require("graphql");

module.exports = {
  type: Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    },
    theme : {
      type : GraphQLString
    },
    legalBasis : {
      type : GraphQLString
    },
    navigation : {
      type : GraphQLBoolean
    }
  },

  resolve(_, args, ctx) {
    return ctx.repositories.Questionnaire.update(args);
  }
};
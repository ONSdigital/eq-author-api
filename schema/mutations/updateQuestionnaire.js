const { Questionnaire, LegalBasisEnum } = require("../types");
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
      type : LegalBasisEnum
    },
    navigation : {
      type : GraphQLBoolean
    },
    surveyId : {
        type: GraphQLString
    }
  },

  resolve(_, args, ctx) {
    return ctx.repositories.Questionnaire.update(args);
  }
};
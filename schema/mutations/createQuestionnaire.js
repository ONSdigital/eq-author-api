const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean
} = require("graphql");
const { Questionnaire, LegalBasisEnum } = require("../types");

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
      type : new GraphQLNonNull(LegalBasisEnum)
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
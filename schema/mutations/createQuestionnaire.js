const models = require("../../models");
const { Questionnaire } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean
} = require("graphql");

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
    }
  },

  resolve(source, { title, description, theme, legalBasis, navigation }) {
    return models.Questionnaire.create({
      title,
      description,
      theme,
      legalBasis,
      navigation
    });
  }
};
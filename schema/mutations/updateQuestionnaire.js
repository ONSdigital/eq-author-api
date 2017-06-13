const models = require("../../models");
const { Questionnaire } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} = require("graphql");


module.exports = {
  type: Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
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

  resolve(source, { id, title, description, theme, legalBasis, navigation }) {
    return models.Questionnaire
      .findById(id)
      .then(questionnaire => questionnaire.update({
        title,
        description,
        theme,
        legalBasis,
        navigation
      }));
  }
};
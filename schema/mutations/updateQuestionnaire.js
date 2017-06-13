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
      type : GraphQLID
    },
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
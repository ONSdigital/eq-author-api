const models = require("../../models");
const { Page } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID
} = require("graphql");

module.exports = {
  type: Page,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    questionnaireId : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(source, { title, description, questionnaireId }) {
    return models.Page.create({
      title,
      description,
      QuestionnaireId : questionnaireId
    });
  }
};
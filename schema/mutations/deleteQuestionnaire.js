const models = require("../../models");
const { Questionnaire } = require("../types");
const { GraphQLID, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(_, { id }) {
    return models.Questionnaire
      .findById(id)
      .then(questionnaire => questionnaire.destroy().then(() => questionnaire));
  }
}
const models = require("../../models");
const { Questionnaire } = require("../types");
const { GraphQLID } = require("graphql");

module.exports = {
  type : Questionnaire,

  args : {
    id : {
      type : GraphQLID
    }
  },

  resolve(_, { id }) {
    return models.Questionnaire
      .findById(id)
      .then(questionnaire => questionnaire.destroy().then(() => questionnaire));
  }
}
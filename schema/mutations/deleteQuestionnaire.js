const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");
const { Questionnaire } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }) {
    return QuestionnaireRepository.remove(id);
  }
}
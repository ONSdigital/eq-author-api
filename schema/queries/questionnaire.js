const { Questionnaire } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");

module.exports = {
  type: Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(root, { id }) {
    return QuestionnaireRepository.get(id);
  }
};
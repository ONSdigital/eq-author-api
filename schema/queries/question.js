const QuestionRepository = require("../../repositories/QuestionRepository");
const { Question } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Question,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }) {
    return QuestionRepository.get(id);
  }
};
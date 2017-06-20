const QuestionRepository = require("../../repositories/QuestionRepository");
const { Question } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Question,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }) {
    return QuestionRepository.remove(id);
  }
};
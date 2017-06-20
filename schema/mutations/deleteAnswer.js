const AnswerRepository = require("../../repositories/AnswerRepository");
const { Answer } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Answer,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }) {
    return AnswerRepository.remove(id);
  }
};
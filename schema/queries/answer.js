const AnswerRepository = require("../../repositories/AnswerRepository");
const { Answer } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Answer,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(root, { id }) {
    return AnswerRepository.get(id);
  }
};
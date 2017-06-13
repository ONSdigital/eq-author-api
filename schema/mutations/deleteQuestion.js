const models = require("../../models");
const { Question } = require("../types");
const { GraphQLID, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Question,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(_, { id }) {
    return models.Question
      .findById(id)
      .then(question => question.destroy().then(() => question));
  }
};
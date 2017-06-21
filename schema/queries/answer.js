const { Answer } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Answer,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(root, { id }, ctx) {
    return ctx.repositories.Answer.get(id);
  }
};
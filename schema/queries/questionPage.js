const { QuestionPage } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: QuestionPage,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }, ctx) {
    return ctx.repositories.QuestionPage.get(id);
  }
};
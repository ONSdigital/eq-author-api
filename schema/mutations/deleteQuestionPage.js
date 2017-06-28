const { QuestionPage } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : QuestionPage,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }, ctx) {
    return ctx.repositories.QuestionPage.remove(id);
  }
};
const { Questionnaire } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }, ctx) {
    return ctx.repositories.Questionnaire.remove(id);
  }
}
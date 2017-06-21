const { Questionnaire } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(root, { id }, ctx) {
    return ctx.repositories.Questionnaire.get(id);
  }
};
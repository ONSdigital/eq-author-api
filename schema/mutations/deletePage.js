const { Page } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }, ctx) {
    return ctx.repositories.Page.remove(id);
  }
};
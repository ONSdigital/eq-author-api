const { Page } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(parent, { id }, ctx) {
    return ctx.repositories.Page.get(id);
  }
};
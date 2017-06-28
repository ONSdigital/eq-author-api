const { Page } = require("../types");
const { GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Page.update(args);
  }
};
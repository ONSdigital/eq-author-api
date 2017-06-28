const { Page } = require("../types");
const { GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    groupId : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Page.insert(args);
  }
};
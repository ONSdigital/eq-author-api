const { Group } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Group,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }, ctx) {
    return ctx.repositories.Group.remove(id);
  }
};
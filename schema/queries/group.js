const { GraphQLNonNull, GraphQLInt } = require("graphql");
const { Group } = require("../types");

module.exports = {
  type: Group,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(parent, { id }, ctx) {
    return ctx.repositories.Group.get(id);
  }
};
const { Group } = require("../types");
const { GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Group,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    questionnaireId : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Group.insert(args);
  }
};
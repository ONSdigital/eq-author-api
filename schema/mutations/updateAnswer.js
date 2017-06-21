const { Answer } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt
} = require("graphql");

module.exports = {
  type: Answer,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    label : {
      type : GraphQLString
    },
    qCode : {
      type : GraphQLString
    },
    type : {
      type : GraphQLString
    },
    mandatory : {
      type : GraphQLBoolean
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Answer.update(args);
  }
};
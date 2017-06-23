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
      type : new GraphQLNonNull(GraphQLString)
    },
    mandatory : {
      type : new GraphQLNonNull(GraphQLBoolean)
    },
    QuestionId: {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Answer.insert(args);
  }
};
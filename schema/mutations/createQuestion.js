const { Question } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt
} = require("graphql");


module.exports = {
  type: Question,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    type : {
      type : new GraphQLNonNull(GraphQLString)
    },
    mandatory : {
      type : GraphQLBoolean
    },
    pageId : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.Question.insert(args);
  }
};
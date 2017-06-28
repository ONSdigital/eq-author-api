const { QuestionPage, QuestionTypeEnum } = require("../types");
const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");

module.exports = {
  type: QuestionPage,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    type : {
      type : QuestionTypeEnum
    },
    mandatory : {
      type : GraphQLBoolean
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.QuestionPage.update(args);
  }
};
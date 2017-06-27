const { QuestionPage, QuestionTypeEnum } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt
} = require("graphql");


module.exports = {
  type: QuestionPage,

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
      type : new GraphQLNonNull(QuestionTypeEnum)
    },
    mandatory : {
      type : GraphQLBoolean
    },
    groupId : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args, ctx) {
    return ctx.repositories.QuestionPage.insert(args);
  }
};
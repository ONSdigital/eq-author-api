const QuestionRepository = require("../../repositories/QuestionRepository");
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

  resolve(source, args) {
    return QuestionRepository.insert(args);
  }
};
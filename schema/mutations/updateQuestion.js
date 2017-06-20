const QuestionRepository = require("../../repositories/QuestionRepository");
const { Question } = require("../types");
const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");

module.exports = {
  type: Question,

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
      type : GraphQLString
    },
    mandatory : {
      type : GraphQLBoolean
    }
  },

  resolve(source, args) {
    return QuestionRepository.update(args);
  }
};
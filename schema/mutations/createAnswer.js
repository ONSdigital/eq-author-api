const AnswerRepository = require("../../repositories/AnswerRepository");
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
    questionId: {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args) {
    return AnswerRepository.insert(args);
  }
};
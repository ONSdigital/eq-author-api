const QuestionRepository = require("../../repositories/QuestionRepository");
const AnswerRepository = require("../../repositories/AnswerRepository");
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLBoolean, GraphQLInt } = require("graphql");
const Answer = require("./Answer");

module.exports = new GraphQLObjectType({
  name : "Question",
  description: "A question",
  
  fields : {
    id : {
      type : GraphQLInt
    },

    title : {
      type : GraphQLString
    },

    description : {
      type : GraphQLString
    },

    guidance : {
      type: GraphQLString
    },

    type : {
      type : GraphQLString
    },

    mandatory : {
      type : GraphQLBoolean,
      defaultValue : false
    },

    answers : {
      type: new GraphQLList(Answer),
      resolve({ id }) {
        return AnswerRepository.findAll({ QuestionId : id });
      }
    },

    PageId : {
      type : GraphQLInt
    },
  },

  resolve(root, { id }) {
    return QuestionRepository.get(id);
  }
});
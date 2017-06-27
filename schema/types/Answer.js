const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } = require("graphql");
const AnswerTypeEnum = require("./AnswerTypeEnum");

module.exports = new GraphQLObjectType({
  name : "Answer",
  description : "An answer",

  fields : () => ({
    id : {
      type: GraphQLInt
    },

    description : {
      type : GraphQLString
    },

    guidance : {
      type : GraphQLString
    },

    qCode : {
      type : GraphQLString
    },

    label : {
      type: GraphQLString
    },

    type : {
      type : AnswerTypeEnum
    },

    mandatory : {
      type : GraphQLBoolean
    },

    QuestionPageId : {
      type : GraphQLInt
    }
  })
});
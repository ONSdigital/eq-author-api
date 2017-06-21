const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require("graphql");
const Question = require("./Question");

module.exports = new GraphQLObjectType({
  name : "Page",
  description : "A page",
  
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

    questions : {
      type: new GraphQLList(Question),
      resolve({ id }, args, ctx) {
        return ctx.repositories.Question.findAll({ PageId : id });
      }
    },

    QuestionnaireId : {
      type : GraphQLInt
    },
  }
});
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
      resolve({ id }, args, ctx) {
        return ctx.repositories.Answer.findAll({ QuestionId : id });
      }
    },

    PageId : {
      type : GraphQLInt
    },
  },

  resolve(root, { id }, ctx) {
    return ctx.repositories.Question.get(id);
  }
});
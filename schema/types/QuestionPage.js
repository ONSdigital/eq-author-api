const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLNonNull } = require("graphql");
const Answer = require("./Answer");
const Page = require("./Page");
const QuestionTypeEnum = require("./QuestionTypeEnum");
const PageTypeEnum = require("./PageTypeEnum");


module.exports = new GraphQLObjectType({
  name : "QuestionPage",
  description: "A question",

  interfaces: () => [Page],
  
  fields : () => ({
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },

    title : {
      type : new GraphQLNonNull(GraphQLString)
    },

    description : {
      type : GraphQLString
    },

    guidance : {
      type: GraphQLString
    },

    pageType : {
      type: new GraphQLNonNull(PageTypeEnum)
    },

    type : {
      type : new GraphQLNonNull(QuestionTypeEnum),
    },

    mandatory : {
      type : GraphQLBoolean,
      defaultValue : false
    },

    answers : {
      type: new GraphQLList(Answer),
      resolve({ id }, args, ctx) {
        return ctx.repositories.Answer.findAll({ QuestionPageId : id });
      }
    },

    GroupId: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
});
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLNonNull } = require("graphql");
const Answer = require("./Answer");
const Page = require("./Page");

module.exports = new GraphQLObjectType({
  name : "Question",
  description: "A question",

  interfaces: [Page],
  
  fields : {
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
      type: new GraphQLNonNull(GraphQLString)
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

    QuestionnaireId: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  }
});
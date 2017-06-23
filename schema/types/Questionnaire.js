const { GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString, GraphQLInt } = require("graphql");

const Page = require("./Page");

module.exports = new GraphQLObjectType({
  name : "Questionnaire",
  description : "A Questionnaire",

  fields: () => ({
    id : {
      type: GraphQLInt
    },

    title : {
      type: GraphQLString
    },

    description : {
      type: GraphQLString
    },

    theme : {
      type: GraphQLString
    },

    legalBasis : {
      type: GraphQLString
    },

    navigation : {
      type: GraphQLBoolean
    },

    pages : {
      type : new GraphQLList(Page),

      resolve({ id }, args, ctx) {
        return ctx.repositories.Page.findAll({ QuestionnaireId : id });
      }
    }
  })
});
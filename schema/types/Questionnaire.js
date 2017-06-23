const { GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString, GraphQLInt } = require("graphql");

const Group = require("./Group");

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

    groups : {
      type : new GraphQLList(Group),

      resolve({ id }, args, ctx) {
        return ctx.repositories.Group.findAll({ QuestionnaireId : id });
      }
    }
  })
});
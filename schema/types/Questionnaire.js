const models = require("../../models");
const { GraphQLObjectType, GraphQLList } = require("graphql");
const { attributeFields, resolver } = require("graphql-sequelize");
const Page = require("./Page");

module.exports = new GraphQLObjectType({
  name : "Questionnaire",
  description : "A Questionnaire",

  fields: Object.assign(attributeFields(models.Questionnaire), {
    pages : {
      type : new GraphQLList(Page),
      resolve: resolver(models.Questionnaire.Pages)
    }
  })

});
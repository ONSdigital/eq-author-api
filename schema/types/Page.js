const models = require("../../models");
const { GraphQLObjectType, GraphQLList } = require("graphql");
const { attributeFields, resolver } = require("graphql-sequelize");
const Question = require("./Question");

module.exports = new GraphQLObjectType({
  name : "Page",
  description : "A page",
  fields : Object.assign(attributeFields(models.Page), {
    questions : {
      type: new GraphQLList(Question),
      resolve: resolver(models.Page.Questions)
    }
  })
});
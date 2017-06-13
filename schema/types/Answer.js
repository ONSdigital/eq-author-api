const models = require("../../models");
const { GraphQLObjectType } = require("graphql");
const { attributeFields } = require("graphql-sequelize");

module.exports = new GraphQLObjectType({
  name : "Answer",
  description : "An answer",
  fields : attributeFields(models.Answer)
});
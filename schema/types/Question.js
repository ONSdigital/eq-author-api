const models = require("../../models");
const { GraphQLObjectType, GraphQLList } = require("graphql");
const { attributeFields, resolver } = require("graphql-sequelize");
const Answer = require("./Answer");


module.exports = new GraphQLObjectType({
  name : "Question",
  description: "A question",
  fields: Object.assign(attributeFields(models.Question), {
    answers : {
      type: new GraphQLList(Answer),
      resolve: resolver(models.Question.Answers)
    }
  })
});
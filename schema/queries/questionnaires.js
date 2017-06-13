const models = require("../../models");
const { Questionnaire } = require("../types");
const { resolver } = require("graphql-sequelize");
const { GraphQLList } = require("graphql");

module.exports = {
  type : new GraphQLList(Questionnaire),
  resolve: resolver(models.Questionnaire)
};
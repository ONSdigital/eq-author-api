const models = require("../../models");
const { Questionnaire } = require("../types");
const { resolver } = require("graphql-sequelize");
const { GraphQLNonNull, GraphQLID } = require("graphql");

module.exports = {
  type: Questionnaire,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve: resolver(models.Questionnaire)
};
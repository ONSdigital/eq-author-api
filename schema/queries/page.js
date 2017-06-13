const models = require("../../models");
const { Page } = require("../types");
const { resolver } = require("graphql-sequelize");
const { GraphQLNonNull, GraphQLID } = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve : resolver(models.Page)
};
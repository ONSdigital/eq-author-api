const models = require("../../models");
const { Answer } = require("../types");
const { resolver } = require("graphql-sequelize");
const { GraphQLNonNull, GraphQLID } = require("graphql");

module.exports = {
  type: Answer,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve : resolver(models.Answer)
};
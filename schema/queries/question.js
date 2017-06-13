const models = require("../../models");
const { Question } = require("../types");
const { resolver } = require("graphql-sequelize");
const { GraphQLNonNull, GraphQLID } = require("graphql");

module.exports = {
  type: Question,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve : resolver(models.Question)
};
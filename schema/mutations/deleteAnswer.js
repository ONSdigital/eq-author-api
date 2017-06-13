const models = require("../../models");
const { Answer } = require("../types");
const { GraphQLID } = require("graphql");

module.exports = {
  type : Answer,

  args : {
    id : {
      type : GraphQLID
    }
  },

  resolve(_, { id }) {
    return models.Answer
      .findById(id)
      .then(answer => answer.destroy().then(() => answer));
  }
};
const models = require("../../models");
const { Page } = require("../types");
const { GraphQLID } = require("graphql");

module.exports = {
  type : Page,

  args : {
    id : {
      type : GraphQLID
    }
  },

  resolve(_, { id }) {
    return models.Page
      .findById(id)
      .then(page => page.destroy().then(() => page));
  }
};
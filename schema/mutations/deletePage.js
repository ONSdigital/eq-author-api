const models = require("../../models");
const { Page } = require("../types");
const { GraphQLID, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(_, { id }) {
    return models.Page
      .findById(id)
      .then(page => page.destroy().then(() => page));
  }
};
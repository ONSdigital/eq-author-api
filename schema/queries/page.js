const PagesRepository = require("../../repositories/PagesRepository");
const { Page } = require("../types");
const { GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(parent, { id }) {
    return PagesRepository.get(id);
  }
};
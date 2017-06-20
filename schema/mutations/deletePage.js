const PagesRepository = require("../../repositories/PagesRepository");
const { Page } = require("../types");
const { GraphQLInt, GraphQLNonNull } = require("graphql");

module.exports = {
  type : Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(_, { id }) {
    return PagesRepository.remove(id);
  }
};
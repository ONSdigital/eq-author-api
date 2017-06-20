const PagesRepository = require("../../repositories/PagesRepository");
const { Page } = require("../types");
const { GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    }
  },

  resolve(source, args) {
    return PagesRepository.update(args);
  }
};
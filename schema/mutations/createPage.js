const PagesRepository = require("../../repositories/PagesRepository");
const { Page } = require("../types");
const { GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

module.exports = {
  type: Page,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    questionnaireId : {
      type : new GraphQLNonNull(GraphQLInt)
    }
  },

  resolve(source, args) {
    return PagesRepository.insert(args);
  }
};
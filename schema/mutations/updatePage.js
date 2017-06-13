const models = require("../../models");
const { Page } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID
} = require("graphql");

module.exports = {
  type: Page,

  args : {
    id : {
      type : new GraphQLNonNull(GraphQLID)
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    }
  },

  resolve(source, { id, title, description }) {
    return models.Page
      .findById(id)
      .then(page => page.update({ title, description }));
  }
};
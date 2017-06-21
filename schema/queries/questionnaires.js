const { Questionnaire } = require("../types");
const { GraphQLList } = require("graphql");

module.exports = {
  type : new GraphQLList(Questionnaire),

  resolve(root, args, ctx) {
    return ctx.repositories.Questionnaire.all();
  }

};
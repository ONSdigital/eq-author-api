const { GraphQLObjectType } = require("graphql");
const questionnaires = require("./questionnaires");
const questionnaire = require("./questionnaire");
const group = require("./group");
const page = require("./page");
const questionPage = require("./questionPage");
const answer = require("./answer");

module.exports = new GraphQLObjectType({
  name: 'Queries',
  description: 'This is the root query',

  fields: {
    questionnaires,
    questionnaire,
    group,
    page,
    questionPage,
    answer,
  }
});
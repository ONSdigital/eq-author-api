const { GraphQLObjectType } = require("graphql");
const questionnaires = require("./questionnaires");
const questionnaire = require("./questionnaire");
const page = require("./page");
const question = require("./question");
const answer = require("./answer");

module.exports = new GraphQLObjectType({
  name: 'Queries',
  description: 'This is the root query',

  fields: {
    questionnaires,
    questionnaire,
    page,
    question,
    answer
  }
});
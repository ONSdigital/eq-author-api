const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");
const { Questionnaire } = require("../types");
const { GraphQLList } = require("graphql");

module.exports = {
  type : new GraphQLList(Questionnaire),

  resolve() {
    return QuestionnaireRepository.all();
  }

};
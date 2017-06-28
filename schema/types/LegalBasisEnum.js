const { GraphQLEnumType } = require("graphql");

module.exports = new GraphQLEnumType({
  name: 'LegalBasis',
  description: 'Legal basis of the questionnaire',

  values: {
    Voluntary : {
      value: "Voluntary",
      description: "Questionnaire is voluntary",
    },

    StatisticsOfTradeAct : {
      value: "StatisticsOfTradeAct",
      description: 'Questionnaire is mandatory',
    }
  }
});
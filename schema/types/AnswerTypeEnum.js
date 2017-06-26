const { GraphQLEnumType } = require("graphql");

module.exports = new GraphQLEnumType({
  name: 'AnswerType',
  description: 'Legal basis of the questionnaire',

  values: {
    Checkbox : {
      value: "Checkbox"
    },
    Currency : {
      value: "Currency"
    },
    Date : {
      value: "Date"
    },
    MonthYearDate : {
      value: "MonthYearDate"
    },
    Integer : {
      value: "Integer"
    },
    Percentage : {
      value: "Percentage"
    },
    PositiveInteger : {
      value: "PositiveInteger"
    },
    Radio : {
      value: "Radio"
    },
    TextArea : {
      value: "TextArea"
    },
    TextField : {
      value: "TextField"
    },
    Relationship : {
      value: "Relationship"
    }
  }
});
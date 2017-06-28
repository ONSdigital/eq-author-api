const { GraphQLEnumType } = require("graphql");

module.exports = new GraphQLEnumType({
  name: "QuestionType",
  description: "The type of the question",

  values: {
    General : {
      value : "General"
    },

    DateRange : {
      value : "DateRange"
    },

    RepeatingAnswer : {
      value : "RepeatingAnswer"
    },

    Relationship : {
      value : "Relationship"
    }
  }
});
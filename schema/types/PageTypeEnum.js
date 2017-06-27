const { GraphQLEnumType } = require("graphql");

module.exports = new GraphQLEnumType({
  name: "PageType",
  description: "The type of the Page",

  values: {
    QuestionPage : {
      value : "QuestionPage"
    },

    InterstitialPage : {
      value : "InterstitialPage"
    },
  }
});
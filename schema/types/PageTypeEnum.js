const { GraphQLEnumType } = require("graphql");

module.exports = new GraphQLEnumType({
  name: "PageType",
  description: "The type of the question",

  values: {
    Question : {
      value : "Question"
    },

    Interstitial : {
      value : "Interstitial"
    },
  }
});
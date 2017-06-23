const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } = require("graphql");

module.exports = new GraphQLObjectType({
  name : "Answer",
  description : "An answer",

  fields : () => ({
    id : {
      type: GraphQLInt
    },

    description : {
      type : GraphQLString
    },

    guidance : {
      type : GraphQLString
    },

    qCode : {
      type : GraphQLString
    },

    label : {
      type: GraphQLString
    },

    type : {
      type : GraphQLString
    },

    mandatory : {
      type : GraphQLBoolean
    },

    QuestionId : {
      type : GraphQLInt
    }
  })
});
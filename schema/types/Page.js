const { GraphQLInterfaceType, GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

const resolveType = ({ pageType }) => {
  switch(pageType) {
    case "Question":
      return require("./Question");
    default:
      throw new TypeError(`Unknown type of Page: ${pageType}`);
  }
};

module.exports = new GraphQLInterfaceType({
  name : "Page",
  description : "A page",

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: GraphQLString
    },

    QuestionnaireId: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  },

  resolveType: resolveType
});
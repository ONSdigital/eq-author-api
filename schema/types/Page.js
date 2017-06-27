const { GraphQLInterfaceType, GraphQLString, GraphQLNonNull, GraphQLInt } = require("graphql");

const resolveType = ({ pageType }) => {
  switch(pageType) {
    case "QuestionPage":
      return require("./QuestionPage");
    default:
      throw new TypeError(`Unknown type of Page: ${pageType}`);
  }
};

module.exports = new GraphQLInterfaceType({
  name : "Page",
  description : "A page",
  resolveType,

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: GraphQLString
    },
    GroupId: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  }),

});
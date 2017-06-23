const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const Page = require("./Page");

module.exports = new GraphQLObjectType({
  name : "Group",
  description: "A group",
  
  fields : () => ({
    id : {
      type : new GraphQLNonNull(GraphQLInt)
    },

    title : {
      type : new GraphQLNonNull(GraphQLString)
    },

    description : {
      type : GraphQLString
    },

    pages : {
      type: new GraphQLList(Page),
      resolve({ id }, args, ctx) {
        return ctx.repositories.Page.findAll({ GroupId : id });
      }
    },

    QuestionnaireId: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
});
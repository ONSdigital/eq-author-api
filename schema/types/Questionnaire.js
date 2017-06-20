const { GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString, GraphQLInt } = require("graphql");

const Page = require("./Page");
const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");
const PagesRepository = require("../../repositories/PagesRepository")

module.exports = new GraphQLObjectType({
  name : "Questionnaire",
  description : "A Questionnaire",

  fields: {
    id : {
      type: GraphQLInt
    },

    title : {
      type: GraphQLString
    },

    description : {
      type: GraphQLString
    },

    theme : {
      type: GraphQLString
    },

    legalBasis : {
      type: GraphQLString
    },

    navigation : {
      type: GraphQLBoolean
    },

    pages : {
      type : new GraphQLList(Page),
      resolve({ id }) {
        return PagesRepository.findAll({ QuestionnaireId : id });
      }
    }
  },

  resolve(root, { id }) {
    return QuestionnaireRepository.get(id);
  }

});
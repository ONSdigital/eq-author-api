const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require("graphql");
const QuestionRepository = require("../../repositories/QuestionRepository");
const PagesRepository = require("../../repositories/PagesRepository")
const Question = require("./Question");

module.exports = new GraphQLObjectType({
  name : "Page",
  description : "A page",
  
  fields : {
    id : {
      type : GraphQLInt
    },

    title : {
      type : GraphQLString
    },

    description : {
      type : GraphQLString
    },

    questions : {
      type: new GraphQLList(Question),
      resolve({ id }) {
        return QuestionRepository.findAll({ PageId : id });
      }
    },

    QuestionnaireId : {
      type : GraphQLInt
    },
  },

  resolve(root, { id }) {
    return PagesRepository.get(id);
  }
});
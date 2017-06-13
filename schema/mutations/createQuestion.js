const models = require("../../models");
const { Question } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} = require("graphql");


module.exports = {
  type: Question,

  args : {
    title : {
      type : new GraphQLNonNull(GraphQLString)
    },
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    type : {
      type : new GraphQLNonNull(GraphQLString)
    },
    mandatory : {
      type : GraphQLBoolean
    },
    pageId : {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(source, { title, description, guidance, type, mandatory, pageId }) {
    return models.Question.create({
      title,
      description,
      guidance,
      type,
      mandatory,
      PageId : pageId
    });
  }
};
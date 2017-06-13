const models = require("../../models");
const { Question } = require("../types");
const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLID
} = require("graphql");

module.exports = {
  type: Question,

  args : {
    id : {
      type : GraphQLID
    },
    title : {
      type : GraphQLString
    },
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    type : {
      type : GraphQLString
    },
    mandatory : {
      type : GraphQLBoolean
    }
  },

  resolve(source, { id, title, description, guidance, type, mandatory }) {
    return models.Question
      .findById(id)
      .then(question => question.update({
        title,
        description,
        guidance,
        type,
        mandatory
      }));
  }
};
const models = require("../../models");
const { Answer } = require("../types");
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} = require("graphql");

module.exports = {
  type: Answer,

  args : {
    description : {
      type : GraphQLString
    },
    guidance : {
      type : GraphQLString
    },
    label : {
      type : GraphQLString
    },
    qCode : {
      type : GraphQLString
    },
    type : {
      type : new GraphQLNonNull(GraphQLString)
    },
    mandatory : {
      type : new GraphQLNonNull(GraphQLBoolean)
    },
    questionId: {
      type : new GraphQLNonNull(GraphQLID)
    }
  },

  resolve(source, { description, guidance, label, qCode, type, mandatory, questionId }) {
    return models.Answer.create({
      description,
      guidance,
      label,
      qCode,
      type,
      mandatory,
      QuestionId : questionId
    });
  }
};
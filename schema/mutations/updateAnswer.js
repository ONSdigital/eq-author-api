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
    id : {
      type : new GraphQLNonNull(GraphQLID)
    },
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
      type : GraphQLString
    },
    mandatory : {
      type : GraphQLBoolean
    }
  },

  resolve(source, { id, description, guidance, label, qCode, type, mandatory }) {
    return models.Answer
      .findById(id)
      .then(answer => answer.update({
        description,
        guidance,
        label,
        qCode,
        type,
        mandatory
      }));
  }
};
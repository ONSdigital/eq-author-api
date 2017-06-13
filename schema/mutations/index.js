const { GraphQLObjectType } = require("graphql");
const createQuestionnaire = require("./createQuestionnaire");
const updateQuestionnaire = require("./updateQuestionnaire");
const deleteQuestionnaire = require("./deleteQuestionnaire");
const createPage = require("./createPage");
const updatePage = require("./updatePage");
const deletePage = require("./deletePage");
const createQuestion = require("./createQuestion");
const updateQuestion = require("./updateQuestion");
const deleteQuestion = require("./deleteQuestion");
const createAnswer = require("./createAnswer");
const updateAnswer = require("./updateAnswer");
const deleteAnswer = require("./deleteAnswer");

// Define a root mutation.
// Think of this as public API for mutation

const mutations = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Functions to mutate stuff',
  fields: {

    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,

    createPage,
    updatePage,
    deletePage,

    createQuestion,
    updateQuestion,
    deleteQuestion,

    createAnswer,
    updateAnswer,
    deleteAnswer

  }
});

module.exports = mutations
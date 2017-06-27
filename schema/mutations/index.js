const { GraphQLObjectType } = require("graphql");
const createQuestionnaire = require("./createQuestionnaire");
const updateQuestionnaire = require("./updateQuestionnaire");
const deleteQuestionnaire = require("./deleteQuestionnaire");
const createGroup = require("./createGroup");
const updateGroup = require("./updateGroup");
const deleteGroup = require("./deleteGroup");
const createPage = require("./createPage");
const updatePage = require("./updatePage");
const deletePage = require("./deletePage");
const createQuestionPage = require("./createQuestionPage");
const updateQuestionPage = require("./updateQuestionPage");
const deleteQuestionPage = require("./deleteQuestionPage");
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

    createGroup,
    updateGroup,
    deleteGroup,

    createPage,
    updatePage,
    deletePage,

    createQuestionPage,
    updateQuestionPage,
    deleteQuestionPage,

    createAnswer,
    updateAnswer,
    deleteAnswer

  }
});

module.exports = mutations
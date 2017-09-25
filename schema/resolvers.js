const { GraphQLDate } = require("graphql-iso-date");
const { includes } = require("lodash");

const getId = args => args.newId || args.id;
const getNewId = entity => entity.id.toString(10);
const getInputArgs = args => args.input || args;
const getIdFromArgs = args => getInputArgs(args).id;

const Resolvers = {
  Query: {
    questionnaires: (_, args, ctx) => ctx.repositories.Questionnaire.findAll(),
    questionnaire: (root, args, ctx) =>
      ctx.repositories.Questionnaire.get(getId(args)),
    section: (parent, args, ctx) => ctx.repositories.Section.get(getId(args)),
    page: (parent, args, ctx) => ctx.repositories.Page.get(getId(args)),
    questionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.get(getId(args)),
    answer: (root, args, ctx) => ctx.repositories.Answer.get(getId(args)),
    option: (root, args, ctx) => ctx.repositories.Option.get(getId(args))
  },

  Mutation: {
    createQuestionnaire: async (root, args, ctx) => {
      const questionnaire = await ctx.repositories.Questionnaire.insert(
        getInputArgs(args)
      );
      const section = {
        title: "",
        description: "",
        questionnaireId: questionnaire.id
      };

      await Resolvers.Mutation.createSection(root, section, ctx);
      return questionnaire;
    },
    updateQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.update(getInputArgs(args)),
    deleteQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.remove(getIdFromArgs(args)),

    createSection: async (root, args, ctx) => {
      const section = await ctx.repositories.Section.insert(getInputArgs(args));
      const page = {
        pageType: "QuestionPage",
        title: "",
        description: "",
        sectionId: section.id
      };

      await ctx.repositories.Page.insert(page);
      return section;
    },
    updateSection: (_, args, ctx) =>
      ctx.repositories.Section.update(getInputArgs(args)),
    deleteSection: (_, args, ctx) =>
      ctx.repositories.Section.remove(getIdFromArgs(args)),

    createPage: (root, args, ctx) =>
      ctx.repositories.Page.insert(getInputArgs(args)),
    updatePage: (_, args, ctx) =>
      ctx.repositories.Page.update(getInputArgs(args)),
    deletePage: (_, args, ctx) =>
      ctx.repositories.Page.remove(getIdFromArgs(args)),

    createQuestionPage: (root, args, ctx) =>
      ctx.repositories.QuestionPage.insert(getInputArgs(args)),
    updateQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.update(getInputArgs(args)),
    deleteQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.remove(getIdFromArgs(args)),

    createAnswer: async (root, args, ctx) => {
      const answer = await ctx.repositories.Answer.insert(getInputArgs(args));

      if (answer.type === "Checkbox" || answer.type === "Radio") {
        const defaultOptions = [];
        const defaultOption = {
          label: "",
          description: "",
          value: "",
          qCode: "",
          answerId: answer.id
        };

        defaultOptions.push(defaultOption);

        if (answer.type === "Radio") {
          defaultOptions.push(defaultOption);
        }

        const promises = defaultOptions.map(it =>
          Resolvers.Mutation.createOption(root, it, ctx)
        );

        await Promise.all(promises);
      }

      return answer;
    },
    updateAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.update(getInputArgs(args)),
    deleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.remove(getIdFromArgs(args)),

    createOption: (root, args, ctx) =>
      ctx.repositories.Option.insert(getInputArgs(args)),
    updateOption: (_, args, ctx) =>
      ctx.repositories.Option.update(getInputArgs(args)),
    deleteOption: (_, args, ctx) =>
      ctx.repositories.Option.remove(getIdFromArgs(args))
  },

  Questionnaire: {
    newId: getNewId,
    sections: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ QuestionnaireId: questionnaire.id })
  },

  Section: {
    newId: getNewId,
    pages: (section, args, ctx) =>
      ctx.repositories.Page.findAll({ SectionId: section.id }),
    questionnaire: (section, args, ctx) =>
      ctx.repositories.Questionnaire.get(section.questionnaireId)
  },

  Page: {
    __resolveType: ({ pageType }) => pageType
  },

  QuestionPage: {
    newId: getNewId,
    answers: ({ id }, args, ctx) =>
      ctx.repositories.Answer.findAll({ QuestionPageId: id }),
    section: ({ sectionId }, args, ctx) =>
      ctx.repositories.Section.get(sectionId)
  },

  Answer: {
    __resolveType: ({ type }) =>
      includes(["Checkbox", "Radio"], type)
        ? "MultipleChoiceAnswer"
        : "BasicAnswer"
  },

  BasicAnswer: {
    newId: getNewId,
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId)
  },

  MultipleChoiceAnswer: {
    newId: getNewId,
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId),
    options: (answer, args, ctx) =>
      ctx.repositories.Option.findAll({ AnswerId: answer.id })
  },

  Option: {
    newId: getNewId,
    answer: ({ answerId }, args, ctx) => ctx.repositories.Answer.get(answerId)
  },

  Date: GraphQLDate
};

module.exports = Resolvers;

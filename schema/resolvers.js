const { GraphQLDate } = require("graphql-iso-date");
const { includes } = require("lodash");

const getId = args => args.newId || args.id;
const getNewId = entity => entity.id.toString(10);

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
        args.input
      );
      const section = {
        title: "",
        description: "",
        questionnaireId: questionnaire.id
      };

      await Resolvers.Mutation.createSection(root, { input: section }, ctx);
      return questionnaire;
    },
    updateQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.update(args.input),
    deleteQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.remove(args.input.id),

    createSection: async (root, args, ctx) => {
      const section = await ctx.repositories.Section.insert(args.input);
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
      ctx.repositories.Section.update(args.input),
    deleteSection: (_, args, ctx) =>
      ctx.repositories.Section.remove(args.input.id),

    createPage: (root, args, ctx) => ctx.repositories.Page.insert(args.input),
    updatePage: (_, args, ctx) => ctx.repositories.Page.update(args.input),
    deletePage: (_, args, ctx) => ctx.repositories.Page.remove(args.input.id),

    createQuestionPage: (root, args, ctx) =>
      ctx.repositories.QuestionPage.insert(args.input),
    updateQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.update(args.input),
    deleteQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.remove(args.input.id),

    createAnswer: async (root, args, ctx) => {
      const answer = await ctx.repositories.Answer.insert(args.input);

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
          Resolvers.Mutation.createOption(root, { input: it }, ctx)
        );

        await Promise.all(promises);
      }

      return answer;
    },
    updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args.input),
    deleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.remove(args.input.id),

    createOption: (root, args, ctx) =>
      ctx.repositories.Option.insert(args.input),
    updateOption: (_, args, ctx) => ctx.repositories.Option.update(args.input),
    deleteOption: (_, args, ctx) =>
      ctx.repositories.Option.remove(args.input.id)
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

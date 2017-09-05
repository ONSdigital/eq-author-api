const { merge, includes } = require("lodash");

const Resolvers = {
  Query: {
    questionnaires: (_, args, ctx) => ctx.repositories.Questionnaire.findAll(),
    questionnaire: (root, { id }, ctx) =>
      ctx.repositories.Questionnaire.get(id),
    section: (parent, { id }, ctx) => ctx.repositories.Section.get(id),
    page: (parent, { id }, ctx) => ctx.repositories.Page.get(id),
    questionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.get(id),
    answer: (root, { id }, ctx) => ctx.repositories.Answer.get(id),
    option: (root, { id }, ctx) => ctx.repositories.Option.get(id)
  },

  Mutation: {
    createQuestionnaire: async (root, args, ctx) => {
      const questionnaire = await ctx.repositories.Questionnaire.insert(args);
      const section = {
        title: "",
        description: "",
        questionnaireId: questionnaire.id
      };

      await Resolvers.Mutation.createSection(root, section, ctx);
      return questionnaire;
    },
    updateQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.update(args),
    deleteQuestionnaire: (_, { id }, ctx) =>
      ctx.repositories.Questionnaire.remove(id),

    createSection: async (root, args, ctx) => {
      const section = await ctx.repositories.Section.insert(args);
      const page = {
        pageType: "QuestionPage",
        title: "",
        description: "",
        type: "General",
        sectionId: section.id
      };

      await ctx.repositories.Page.insert(page);
      return section;
    },
    updateSection: (_, args, ctx) => ctx.repositories.Section.update(args),
    deleteSection: (_, { id }, ctx) => ctx.repositories.Section.remove(id),

    createPage: (root, args, ctx) => ctx.repositories.Page.insert(args),
    updatePage: (_, args, ctx) => ctx.repositories.Page.update(args),
    deletePage: (_, { id }, ctx) => ctx.repositories.Page.remove(id),

    createQuestionPage: (root, args, ctx) =>
      ctx.repositories.QuestionPage.insert(args),
    updateQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.update(args),
    deleteQuestionPage: (_, { id }, ctx) =>
      ctx.repositories.QuestionPage.remove(id),

    createAnswer: async (root, args, ctx) => {
      const answer = await ctx.repositories.Answer.insert(args);

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
    updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args),
    deleteAnswer: (_, { id }, ctx) => ctx.repositories.Answer.remove(id),

    createOption: (root, args, ctx) => ctx.repositories.Option.insert(args),
    updateOption: (_, args, ctx) => ctx.repositories.Option.update(args),
    deleteOption: (_, { id }, ctx) => ctx.repositories.Option.remove(id)
  },

  Questionnaire: {
    sections: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ QuestionnaireId: questionnaire.id })
  },

  Section: {
    pages: (section, args, ctx) =>
      ctx.repositories.Page.findAll({ SectionId: section.id }),
    questionnaire: (section, args, ctx) =>
      ctx.repositories.Questionnaire.get(section.questionnaireId)
  },

  Page: {
    __resolveType: ({ pageType }) => pageType
  },

  QuestionPage: {
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
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId)
  },

  MultipleChoiceAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId),
    options: (answer, args, ctx) =>
      ctx.repositories.Option.findAll({ AnswerId: answer.id })
  },

  Option: {
    answer: ({ answerId }, args, ctx) => ctx.repositories.Answer.get(answerId)
  }
};

const Deprecations = {
  Query: {
    group: Resolvers.Query.section
  },
  Mutation: {
    createGroup: Resolvers.Mutation.createSection,
    updateGroup: Resolvers.Mutation.updateSection,
    deleteGroup: Resolvers.Mutation.deleteSection
  },
  Questionnaire: {
    groups: Resolvers.Questionnaire.sections
  }
};

module.exports = merge({}, Resolvers, Deprecations);

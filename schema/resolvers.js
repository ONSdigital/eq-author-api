module.exports = {
  Query: {
    questionnaires: (_, args, ctx) => ctx.repositories.Questionnaire.findAll(),
    questionnaire: (root, { id }, ctx) =>
      ctx.repositories.Questionnaire.get(id),
    section: (parent, { id }, ctx) => ctx.repositories.Section.get(id),
    page: (parent, { id }, ctx) => ctx.repositories.Page.get(id),
    questionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.get(id),
    answer: (root, { id }, ctx) => ctx.repositories.Answer.get(id)
  },

  Mutation: {
    createQuestionnaire: (root, args, ctx) =>
      ctx.repositories.Questionnaire.insert(args),
    updateQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.update(args),
    deleteQuestionnaire: (_, { id }, ctx) =>
      ctx.repositories.Questionnaire.remove(id),

    createSection: (root, args, ctx) => ctx.repositories.Section.insert(args),
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

    createAnswer: (root, args, ctx) => ctx.repositories.Answer.insert(args),
    updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args),
    deleteAnswer: (_, { id }, ctx) => ctx.repositories.Answer.remove(id)
  },

  Questionnaire: {
    sections: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ QuestionnaireId: questionnaire.id }),
    groups: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ QuestionnaireId: questionnaire.id })
  },

  Section: {
    pages: (section, args, ctx) =>
      ctx.repositories.Page.findAll({ SectionId: section.id })
  },

  Page: {
    __resolveType: ({ pageType }) => pageType
  },

  QuestionPage: {
    answers: ({ id }, args, ctx) =>
      ctx.repositories.Answer.findAll({ QuestionPageId: id })
  }
};

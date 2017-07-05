module.exports = {
    Query: {
        questionnaires: (_, ctx) => ctx.repositories.Questionnaire.findAll(),
        questionnaire: (root, { id }, ctx) => ctx.repositories.Questionnaire.get(id),
        group: (parent, { id }, ctx) => ctx.repositories.Group.get(id),
        page: (parent, { id }, ctx) => ctx.repositories.Page.get(id),
        questionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.get(id),
        answer: (root, { id }, ctx) => ctx.repositories.Answer.get(id)
    },
    Mutation: {
        createQuestionnaire: (root, args, ctx) => ctx.repositories.Questionnaire.insert(args),
        updateQuestionnaire: (_, args, ctx) => ctx.repositories.Questionnaire.update(args),
        deleteQuestionnaire: (_, { id }, ctx) => ctx.repositories.Questionnaire.remove(id),

        createGroup: (root, args, ctx) => ctx.repositories.Group.insert(args),
        updateGroup: (_, args, ctx) => ctx.repositories.Group.update(args),
        deleteGroup: (_, { id }, ctx) => ctx.repositories.Group.remove(id),

        createPage: (root, args, ctx) => ctx.repositories.Page.insert(args),
        updatePage: (_, args, ctx) => ctx.repositories.Page.update(args),
        deletePage: (_, { id }, ctx) => ctx.repositories.Page.remove(id),

        createQuestionPage: (root, args, ctx) => ctx.repositories.QuestionPage.insert(args),
        updateQuestionPage: (_, args, ctx) => ctx.repositories.QuestionPage.update(args),
        deleteQuestionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.remove(id),

        createAnswer: (root, args, ctx) => ctx.repositories.Answer.insert(args),
        updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args),
        deleteAnswer: (_, { id }, ctx) => ctx.repositories.Answer.remove(id)
    },
    Questionnaire: {
        groups : (questionnaire, args, ctx) => ctx.repositories.Group.findAll({ QuestionnaireId : questionnaire.id })
    },
    Group: {
        pages: (group, args, ctx) => ctx.repositories.Page.findAll({GroupId: group.id})
    },
    Page: {
        __resolveType: ({ pageType }) => pageType
    },
    QuestionPage: {
        answers: ({id}, args, ctx) => ctx.repositories.Answer.findAll({QuestionPageId: id})
    }

};
const { GraphQLDate } = require("graphql-iso-date");
const { includes, isNil, forEach } = require("lodash");

const whereIn = (field, values) => {
  return function() {
    this.where("id", "in", values);
  };
};

const assertMultipleChoiceAnswer = answer => {
  if (isNil(answer) || !includes(["Checkbox", "Radio"], answer.type)) {
    throw new Error(
      `Answer with id '${answer.id}' must be a Checkbox or Radio.`
    );
  }
};

const Resolvers = {
  Query: {
    questionnaires: (_, args, ctx) => ctx.repositories.Questionnaire.findAll(),
    questionnaire: (root, { id }, ctx) =>
      ctx.repositories.Questionnaire.get(id),
    section: (parent, { id }, ctx) => ctx.repositories.Section.get(id),
    page: (parent, { id }, ctx) => ctx.repositories.Page.get(id),
    questionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.get(id),
    answer: (root, { id }, ctx) => ctx.repositories.Answer.get(id),
    answers: (root, { ids }, ctx) =>
      ctx.repositories.Answer.findAll(whereIn("id", ids)),
    option: (root, { id }, ctx) => ctx.repositories.Option.get(id)
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
    undeleteQuestionnaire: (_, args, ctx) =>
      ctx.repositories.Questionnaire.undelete(args.input.id),

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
    undeleteSection: (_, args, ctx) =>
      ctx.repositories.Section.undelete(args.input.id),

    createPage: (root, args, ctx) => ctx.repositories.Page.insert(args.input),
    updatePage: (_, args, ctx) => ctx.repositories.Page.update(args.input),
    deletePage: (_, args, ctx) => ctx.repositories.Page.remove(args.input.id),
    undeletePage: (_, args, ctx) =>
      ctx.repositories.Page.undelete(args.input.id),
    movePage: (_, args, ctx) => ctx.repositories.Page.move(args.input),

    createQuestionPage: (root, args, ctx) =>
      ctx.repositories.Page.insert(
        Object.assign({}, args.input, { pageType: "QuestionPage" })
      ),
    updateQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.update(args.input),
    deleteQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.remove(args.input.id),
    undeleteQuestionPage: (_, args, ctx) =>
      ctx.repositories.QuestionPage.undelete(args.input.id),

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

      if (answer.type === "DateRange") {
        const compositeArgs = [];

        const defaultOption = {
          label: "",
          description: "",
          guidence: "",
          qCode: "",
          type: "Composite",
          parentAnswerId: answer.id
        };

        compositeArgs.push(defaultOption);

        await compositeArgs.map(it =>
          Resolvers.Mutation.createCompositeAnswerChild(
            root,
            { input: it },
            ctx
          )
        );
        await compositeArgs.map(it =>
          Resolvers.Mutation.createCompositeAnswerChild(
            root,
            { input: it },
            ctx
          )
        );
      }

      return answer;
    },
    createCompositeAnswerChild: (root, args, ctx) => {
      ctx.repositories.Answer.insertChild(args.input);
    },
    updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args.input),
    deleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.remove(args.input.id),

    deleteCompositeAnswer: async (_, args, ctx) => {
      await ctx.repositories.Answer.remove(args.input.id);
      const answerArray = await ctx.repositories.Answer.getChildAnswer(
        args.input.id,
        { isDeleted: false }
      );
      forEach(answerArray, indivAnswer =>
        ctx.repositories.Answer.remove(indivAnswer.id)
      );
    },
    unDeleteCompositeAnswer: async (_, args, ctx) => {
      await ctx.repositories.Answer.undelete(args.input.id);
      const answerArray = await ctx.repositories.Answer.getChildAnswer(
        args.input.id,
        { isDeleted: true }
      );
      forEach(answerArray, indivAnswer =>
        ctx.repositories.Answer.undelete(indivAnswer.id)
      );
    },
    undeleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.undelete(args.input.id),

    createOption: (root, args, ctx) =>
      ctx.repositories.Option.insert(args.input),
    updateOption: (_, args, ctx) => ctx.repositories.Option.update(args.input),
    deleteOption: (_, args, ctx) =>
      ctx.repositories.Option.remove(args.input.id),
    undeleteOption: (_, args, ctx) =>
      ctx.repositories.Option.undelete(args.input.id),
    createOtherAnswer: async (root, args, ctx) => {
      const parentAnswer = await ctx.repositories.Answer.get(
        args.input.parentAnswerId
      );
      assertMultipleChoiceAnswer(parentAnswer);
      return ctx.repositories.Answer.createOtherAnswer(parentAnswer);
    },
    deleteOtherAnswer: async (_, args, ctx) => {
      const parentAnswer = await ctx.repositories.Answer.get(
        args.input.parentAnswerId
      );
      assertMultipleChoiceAnswer(parentAnswer);
      return ctx.repositories.Answer.deleteOtherAnswer(parentAnswer);
    }
  },

  Questionnaire: {
    sections: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ QuestionnaireId: questionnaire.id }),
    createdBy: questionnaire => ({ name: questionnaire.createdBy })
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
      ctx.repositories.Answer.findAll({
        QuestionPageId: id
      }),
    section: ({ sectionId }, args, ctx) =>
      ctx.repositories.Section.get(sectionId)
  },

  Answer: {
    __resolveType: ({ type }) => {
      if (includes(["Checkbox", "Radio"], type)) {
        return "MultipleChoiceAnswer";
      } else if ("DateRange" == type) {
        return "CompositeAnswer";
      } else {
        return "BasicAnswer";
      }
    }
  },

  BasicAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId)
  },

  MultipleChoiceAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId),
    options: (answer, args, ctx) =>
      ctx.repositories.Option.findAll({ AnswerId: answer.id }),
    otherAnswer: async (answer, args, ctx) =>
      ctx.repositories.Answer.getOtherAnswer(answer.id)
  },

  CompositeAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.get(answer.questionPageId),
    answers: async (answer, args, ctx) =>
      ctx.repositories.Answer.getChildAnswer(answer.id, { isDeleted: false })
  },

  Option: {
    answer: ({ answerId }, args, ctx) => ctx.repositories.Answer.get(answerId)
  },

  Date: GraphQLDate
};

module.exports = Resolvers;

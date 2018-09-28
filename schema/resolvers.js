const { GraphQLDate } = require("graphql-iso-date");
const { includes, isNil } = require("lodash");
const GraphQLJSON = require("graphql-type-json");
const { getName } = require("../utils/getName");
const formatRichText = require("../utils/formatRichText");
const {
  getValidationEntity
} = require("../repositories/strategies/validationStrategy");

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
      ctx.repositories.Questionnaire.getById(id),
    section: (parent, { id }, ctx) => ctx.repositories.Section.getById(id),
    page: (parent, { id }, ctx) => ctx.repositories.Page.getById(id),
    questionPage: (_, { id }, ctx) => ctx.repositories.QuestionPage.getById(id),
    answer: (root, { id }, ctx) => ctx.repositories.Answer.getById(id),
    answers: async (root, { ids }, ctx) =>
      ctx.repositories.Answer.getAnswers(ids),
    option: (root, { id }, ctx) => ctx.repositories.Option.getById(id),
    availableRoutingDestinations: (root, { pageId }, ctx) =>
      ctx.repositories.Routing.getRoutingDestinations(pageId)
  },

  Mutation: {
    createQuestionnaire: async (root, args, ctx) => {
      const questionnaire = await ctx.repositories.Questionnaire.insert(
        args.input
      );
      const section = {
        title: "",
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
    duplicateQuestionnaire: () => {
      throw new Error("Not implemented");
    },

    createSection: async (root, args, ctx) => {
      const section = await ctx.repositories.Section.insert(args.input);
      const page = {
        pageType: "QuestionPage",
        title: "",
        description: "",
        sectionId: section.id
      };

      await Resolvers.Mutation.createPage(root, { input: page }, ctx);
      return section;
    },
    updateSection: (_, args, ctx) =>
      ctx.repositories.Section.update(args.input),
    deleteSection: (_, args, ctx) =>
      ctx.repositories.Section.remove(args.input.id),
    undeleteSection: (_, args, ctx) =>
      ctx.repositories.Section.undelete(args.input.id),
    moveSection: (_, args, ctx) => ctx.repositories.Section.move(args.input),
    duplicateSection: () => {
      throw new Error("Not implemented");
    },

    createPage: (root, args, ctx) => ctx.repositories.Page.insert(args.input),

    updatePage: (_, args, ctx) => ctx.repositories.Page.update(args.input),
    deletePage: (_, args, ctx) => ctx.repositories.Page.remove(args.input.id),
    undeletePage: (_, args, ctx) =>
      ctx.repositories.Page.undelete(args.input.id),
    movePage: (_, args, ctx) => ctx.repositories.Page.move(args.input),
    duplicatePage: (_, args, ctx) =>
      ctx.repositories.Page.duplicatePage(args.input.id, args.input.position),

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

    createAnswer: (root, args, ctx) =>
      ctx.repositories.Answer.createAnswer(args, ctx),
    updateAnswer: (_, args, ctx) => ctx.repositories.Answer.update(args.input),
    deleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.remove(args.input.id),
    undeleteAnswer: (_, args, ctx) =>
      ctx.repositories.Answer.undelete(args.input.id),

    createOption: (root, args, ctx) =>
      ctx.repositories.Option.insert(args.input),
    createMutuallyExclusiveOption: (root, { input }, ctx) =>
      ctx.repositories.Option.insert({ mutuallyExclusive: true, ...input }),
    updateOption: (_, args, ctx) => ctx.repositories.Option.update(args.input),
    deleteOption: (_, args, ctx) =>
      ctx.repositories.Option.remove(args.input.id),
    undeleteOption: (_, args, ctx) =>
      ctx.repositories.Option.undelete(args.input.id),
    createOther: async (root, args, ctx) => {
      const parentAnswer = await ctx.repositories.Answer.getById(
        args.input.parentAnswerId
      );
      assertMultipleChoiceAnswer(parentAnswer);
      return ctx.repositories.Answer.createOtherAnswer(parentAnswer);
    },
    deleteOther: async (_, args, ctx) => {
      const parentAnswer = await ctx.repositories.Answer.getById(
        args.input.parentAnswerId
      );
      assertMultipleChoiceAnswer(parentAnswer);
      return ctx.repositories.Answer.deleteOtherAnswer(parentAnswer);
    },
    createRoutingRuleSet: async (root, args, ctx) =>
      ctx.repositories.Routing.createRoutingRuleSet(args.input),
    updateRoutingRuleSet: (_, args, ctx) =>
      ctx.repositories.Routing.updateRoutingRuleSet(args.input),
    deleteRoutingRuleSet: (_, args, ctx) =>
      ctx.repositories.Routing.deleteRoutingRuleSet(args.input),
    resetRoutingRuleSetElse: (_, args, ctx) => {
      return ctx.repositories.Routing.updateRoutingRuleSet(args.input);
    },
    createRoutingRule: async (_, args, ctx) =>
      ctx.repositories.Routing.createRoutingRule(args.input),
    updateRoutingRule: (_, args, ctx) =>
      ctx.repositories.Routing.updateRoutingRule(args.input),
    deleteRoutingRule: (_, args, ctx) =>
      ctx.repositories.Routing.removeRoutingRule(args.input),
    undeleteRoutingRule: (_, args, ctx) =>
      ctx.repositories.Routing.undeleteRoutingRule(args.input),
    createRoutingCondition: (_, args, ctx) =>
      ctx.repositories.Routing.createRoutingCondition(args.input),
    updateRoutingCondition: (_, args, ctx) =>
      ctx.repositories.Routing.updateRoutingCondition(args.input),
    deleteRoutingCondition: (_, args, ctx) =>
      ctx.repositories.Routing.removeRoutingCondition(args.input),
    toggleConditionOption: async (_, args, ctx) =>
      ctx.repositories.Routing.toggleConditionOption(args.input),
    toggleValidationRule: (_, args, ctx) =>
      ctx.repositories.Validation.toggleValidationRule(args.input),
    updateValidationRule: (_, args, ctx) =>
      ctx.repositories.Validation.updateValidationRule(args.input),
    createMetadata: (root, args, ctx) =>
      ctx.repositories.Metadata.insert(args.input),
    updateMetadata: (_, args, ctx) =>
      ctx.repositories.Metadata.update(args.input),
    deleteMetadata: (_, args, ctx) =>
      ctx.repositories.Metadata.remove(args.input.id)
  },

  Questionnaire: {
    sections: (questionnaire, args, ctx) =>
      ctx.repositories.Section.findAll({ questionnaireId: questionnaire.id }),
    createdBy: questionnaire => ({ name: questionnaire.createdBy }),
    questionnaireInfo: ({ id }) => id,
    metadata: (questionnaire, args, ctx) =>
      ctx.repositories.Metadata.findAll({ questionnaireId: questionnaire.id })
  },

  QuestionnaireInfo: {
    totalSectionCount: (questionnaireId, args, ctx) =>
      ctx.repositories.Section.getSectionCount(questionnaireId)
  },

  Section: {
    pages: (section, args, ctx) =>
      ctx.repositories.Page.findAll({ sectionId: section.id }),
    questionnaire: (section, args, ctx) =>
      ctx.repositories.Questionnaire.getById(section.questionnaireId),
    displayName: section => getName(section, "Section"),
    title: (page, args) => formatRichText(page.title, args.format),
    position: ({ position, id }, args, ctx) => {
      if (position !== undefined) {
        return position;
      }
      return ctx.repositories.Section.getPosition({ id });
    }
  },

  Page: {
    __resolveType: ({ pageType }) => pageType,
    position: ({ position, id }, args, ctx) => {
      if (position !== undefined) {
        return position;
      }

      return ctx.repositories.Page.getPosition({ id });
    }
  },

  QuestionPage: {
    answers: ({ id }, args, ctx) =>
      ctx.repositories.Answer.findAll({
        questionPageId: id
      }),
    section: ({ sectionId }, args, ctx) => {
      return ctx.repositories.Section.getById(sectionId);
    },
    position: (page, args, ctx) => Resolvers.Page.position(page, args, ctx),
    routingRuleSet: ({ id: questionPageId }, args, ctx) =>
      ctx.repositories.Routing.findRoutingRuleSetByQuestionPageId({
        questionPageId
      }),
    displayName: page => getName(page, "QuestionPage"),
    title: (page, args) => formatRichText(page.title, args.format)
  },

  RoutingRuleSet: {
    routingRules: ({ id }, args, ctx) => {
      return ctx.repositories.Routing.findAllRoutingRules({
        routingRuleSetId: id
      });
    },
    questionPage: ({ questionPageId }, args, ctx) => {
      return ctx.repositories.Page.getById(questionPageId);
    },
    else: ({ routingDestinationId }, args, ctx) =>
      ctx.repositories.Routing.getRoutingDestination(routingDestinationId)
  },

  RoutingRule: {
    conditions: ({ id }, args, ctx) => {
      return ctx.repositories.Routing.findAllRoutingConditions({
        routingRuleId: id
      });
    },
    goto: (routingRule, args, ctx) =>
      ctx.repositories.Routing.getRoutingDestination(
        routingRule.routingDestinationId
      )
  },

  RoutingCondition: {
    routingValue: ({ id }) => {
      return { conditionId: id };
    },
    questionPage: ({ questionPageId }, args, ctx) => {
      return isNil(questionPageId)
        ? null
        : ctx.repositories.Page.getById(questionPageId);
    },
    answer: ({ answerId }, args, ctx) => {
      return isNil(answerId) ? null : ctx.repositories.Answer.getById(answerId);
    }
  },

  RoutingConditionValue: {
    __resolveType: () => "IDArrayValue"
  },

  IDArrayValue: {
    value: ({ conditionId }, args, ctx) =>
      ctx.repositories.Routing.findAllRoutingConditionValues({ conditionId })
  },

  RoutingDestination: {
    __resolveType: ({ logicalDestination }) => {
      return isNil(logicalDestination)
        ? "AbsoluteDestination"
        : "LogicalDestination";
    }
  },

  AbsoluteDestinations: {
    __resolveType: ({ pageType }) => {
      if (pageType) {
        return "QuestionPage";
      } else {
        return "Section";
      }
    }
  },

  LogicalDestination: {
    id: destination => destination.logicalDestination
  },

  Answer: {
    __resolveType: ({ type }) => {
      if (includes(["Checkbox", "Radio"], type)) {
        return "MultipleChoiceAnswer";
      } else if (includes(["DateRange"], type)) {
        return "CompositeAnswer";
      } else {
        return "BasicAnswer";
      }
    }
  },

  BasicAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.getById(answer.questionPageId),
    validation: answer =>
      ["number", "date"].includes(getValidationEntity(answer.type))
        ? answer
        : null,
    displayName: answer => getName(answer, "BasicAnswer")
  },

  CompositeAnswer: {
    childAnswers: (answer, args, ctx) =>
      ctx.repositories.Answer.splitComposites(answer),
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.getById(answer.questionPageId),
    displayName: answer => getName(answer, "CompositeAnswer")
  },

  MultipleChoiceAnswer: {
    page: (answer, args, ctx) =>
      ctx.repositories.QuestionPage.getById(answer.questionPageId),
    options: (answer, args, ctx) =>
      ctx.repositories.Option.findAll({
        answerId: answer.id,
        mutuallyExclusive: false
      }),
    mutuallyExclusiveOption: (answer, args, ctx) =>
      ctx.repositories.Option.findExclusiveOptionByAnswerId(answer.id),
    other: async ({ id }, args, ctx) => {
      const answer = await ctx.repositories.Answer.getOtherAnswer(id);

      if (isNil(answer)) {
        return null;
      }

      const option = await ctx.repositories.Option.getOtherOption(answer.id);

      if (isNil(option)) {
        return null;
      }

      return {
        answer,
        option
      };
    },
    displayName: answer => getName(answer, "MultipleChoiceAnswer")
  },

  Option: {
    answer: ({ answerId }, args, ctx) =>
      ctx.repositories.Answer.getById(answerId),
    displayName: option => getName(option, "Option")
  },

  ValidationType: {
    __resolveType: answer => {
      const validationEntity = getValidationEntity(answer.type);

      switch (validationEntity) {
        case "number":
          return "NumberValidation";
        case "date":
          return "DateValidation";

        default:
          throw new TypeError(
            `Validation is not supported on '${answer.type}' answers`
          );
      }
    }
  },

  ValidationRule: {
    __resolveType: ({ validationType }) => {
      switch (validationType) {
        case "maxValue":
          return "MaxValueValidationRule";
        case "minValue":
          return "MinValueValidationRule";
        case "earliestDate":
          return "EarliestDateValidationRule";
        case "latestDate":
          return "LatestDateValidationRule";

        default:
          throw new TypeError(
            `Validation is not supported on '${validationType}' answers`
          );
      }
    }
  },

  NumberValidation: {
    minValue: (answer, args, ctx) =>
      ctx.repositories.Validation.findByAnswerIdAndValidationType(
        answer,
        "minValue"
      ),
    maxValue: (answer, args, ctx) =>
      ctx.repositories.Validation.findByAnswerIdAndValidationType(
        answer,
        "maxValue"
      )
  },

  DateValidation: {
    earliestDate: (answer, args, ctx) =>
      ctx.repositories.Validation.findByAnswerIdAndValidationType(
        answer,
        "earliestDate"
      ),
    latestDate: (answer, args, ctx) =>
      ctx.repositories.Validation.findByAnswerIdAndValidationType(
        answer,
        "latestDate"
      )
  },

  MinValueValidationRule: {
    enabled: ({ enabled }) => enabled,
    inclusive: ({ config }) => config.inclusive,
    custom: ({ custom }) => custom
  },

  MaxValueValidationRule: {
    enabled: ({ enabled }) => enabled,
    inclusive: ({ config }) => config.inclusive,
    custom: ({ custom }) => custom
  },

  EarliestDateValidationRule: {
    custom: ({ custom }) => (custom ? new Date(custom) : null),
    offset: ({ config: { offset } }) => offset,
    relativePosition: ({ config: { relativePosition } }) => relativePosition
  },

  LatestDateValidationRule: {
    custom: ({ custom }) => (custom ? new Date(custom) : null),
    offset: ({ config: { offset } }) => offset,
    relativePosition: ({ config: { relativePosition } }) => relativePosition
  },

  Metadata: {
    textValue: ({ type, value }) => (type === "Text" ? value : null),
    languageValue: ({ type, value }) => (type === "Language" ? value : null),
    regionValue: ({ type, value }) => (type === "Region" ? value : null),
    dateValue: ({ type, value }) => {
      if (type !== "Date" || !value) {
        return null;
      }
      return new Date(value);
    },
    displayName: metadata => getName(metadata, "Metadata")
  },

  Date: GraphQLDate,

  JSON: GraphQLJSON
};

module.exports = Resolvers;

const cheerio = require("cheerio");

const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");
const SectionRepository = require("../../repositories/SectionRepository");
const PageRepository = require("../../repositories/PageRepository");
const AnswerRepository = require("../../repositories/AnswerRepository");
const OptionRepository = require("../../repositories/OptionRepository");
const ValidationRepository = require("../../repositories/ValidationRepository");
const MetadataRepository = require("../../repositories/MetadataRepository");
const RoutingRepository = require("../../repositories/RoutingRepository");

const {
  getValidationEntity
} = require("../../repositories/strategies/validationStrategy");
const { validationRuleMap } = require("../../utils/defaultAnswerValidations");

const replacePiping = (field, references) => {
  if (field.indexOf("<span") === -1) {
    return field;
  }

  const $ = cheerio.load(field);

  $("span").map((i, el) => {
    const $el = $(el);
    const pipeType = $el.data("piped");
    const id = $el.data("id");

    const newId = references[pipeType][id];

    // Can't use data as it doesn't work
    // https://github.com/cheeriojs/cheerio/issues/1240
    $el.attr("data-id", newId);

    return $.html($el);
  });

  return $("body").html();
};

const buildValidations = async (validationConfigs = {}, answer) => {
  const validationEntityType = getValidationEntity(answer.type);
  const validationTypes = validationRuleMap[validationEntityType] || [];

  let validations = {};
  for (let i = 0; i < validationTypes.length; ++i) {
    const validationType = validationTypes[i];
    const existingValidation = await ValidationRepository.findByAnswerIdAndValidationType(
      answer,
      validationType
    );

    let validation = existingValidation;
    const validationConfig = validationConfigs[validationType];
    if (validationConfig) {
      const { enabled, ...restOfConfig } = validationConfig;
      if (enabled) {
        await ValidationRepository.toggleValidationRule({
          id: validation.id,
          enabled
        });
      }
      validation = await ValidationRepository.updateValidationRule({
        id: validation.id,
        [`${validationType}Input`]: restOfConfig
      });
    }

    validations[validationType] = validation;
  }

  return validations;
};

const buildOptions = async (optionConfigs = [], answer, references) => {
  let options = [];

  const existingOptions = await OptionRepository.findAll({
    answerId: answer.id
  });
  for (let i = 0; i < optionConfigs.length; ++i) {
    const existingOption = existingOptions[i];
    const { refId, ...optionConfig } = optionConfigs[i];

    const optionDetails = {
      label: "Test label",
      description: "Option description",
      ...optionConfig,
      answerId: answer.id
    };

    let option;
    if (existingOption) {
      option = await OptionRepository.update({
        ...existingOption,
        ...optionDetails
      });
    } else {
      option = await OptionRepository.insert(optionDetails);
    }
    options.push(option);

    if (refId) {
      references.options[refId] = option.id;
    }
  }

  return options;
};

const buildOtherAnswer = async (config, parentAnswer) => {
  const {
    answer: otherAnswer,
    option
  } = await AnswerRepository.createOtherAnswer(parentAnswer);
  otherAnswer.options = [
    await OptionRepository.update({
      ...config,
      id: option.id
    })
  ];
  return otherAnswer;
};

const buildAnswers = async (answerConfigs = [], page, references) => {
  let answers = [];
  for (let i = 0; i < answerConfigs.length; ++i) {
    const {
      options,
      validations,
      otherAnswer,
      refId,
      ...answerConfig
    } = answerConfigs[i];

    let answer = await AnswerRepository.createAnswer({
      label: "Test label",
      description: "Answer description",
      guidance: "Answer guidance",
      type: "TextField",
      ...answerConfig,
      questionPageId: page.id
    });

    if (answerConfig.isDeleted) {
      answer = await AnswerRepository.remove(answer.id);
    }

    if (refId) {
      references.answers[refId] = answer.id;
    }

    answer.options = await buildOptions(options, answer, references);
    answer.validations = await buildValidations(validations, answer);
    if (otherAnswer) {
      answer.otherAnswer = await buildOtherAnswer(otherAnswer, answer);
    }

    answers.push(answer);
  }

  return answers;
};

const buildPages = async (pageConfigs, section, references) => {
  let pages = [];
  for (let i = 0; i < pageConfigs.length; ++i) {
    const { answers, refId, ...pageConfig } = pageConfigs[i];
    let page = await PageRepository.insert({
      pageType: "QuestionPage",
      ...pageConfig,
      title: replacePiping(pageConfig.title || "Test page", references),
      description: replacePiping(
        pageConfig.description || "page description",
        references
      ),
      guidance: replacePiping(
        pageConfig.guidance || "page guidance",
        references
      ),
      sectionId: section.id
    });

    if (pageConfig.isDeleted) {
      page = await PageRepository.remove(page.id);
    }
    if (pageConfig.ruleSet) {
      references.pagesWithRouting.push({ page, pageConfig });
    }
    if (refId) {
      references.pages[refId] = page.id;
    }

    page.answers = await buildAnswers(answers, page, references);

    pages.push(page);
  }

  return pages;
};

const buildSections = async (sectionConfigs, questionnaire, references) => {
  let sections = [];

  for (let i = 0; i < sectionConfigs.length; ++i) {
    const { pages, refId, ...sectionConfig } = sectionConfigs[i];
    const section = await SectionRepository.insert({
      title: "Test section",
      description: "section description",
      ...sectionConfig,
      questionnaireId: questionnaire.id
    });

    if (refId) {
      references.sections[refId] = section.id;
    }

    section.pages = await buildPages(pages, section, references);

    sections.push(section);
  }

  return sections;
};

const buildMetadata = async (
  metadataConfigs = [],
  questionnaire,
  references
) => {
  let metadatas = [];

  references.metadata = {};

  for (let i = 0; i < metadataConfigs.length; ++i) {
    const { refId, ...metadataConfig } = metadataConfigs[i];
    let metadata = await MetadataRepository.insert({
      questionnaireId: questionnaire.id
    });
    metadata = await MetadataRepository.update({
      ...metadataConfig,
      id: metadata.id
    });

    if (refId) {
      references.metadata[refId] = metadata.id;
    }

    metadatas.push(metadata);
  }

  return metadatas;
};

const buildConditionValues = async (valueConfigs, conditionId, references) => {
  let values = [];
  const existingValues = await RoutingRepository.findAllRoutingConditionValues({
    conditionId
  });

  for (let i = 0; i < valueConfigs.length; ++i) {
    const { optionId, customNumber } = valueConfigs[i];
    const existingValue = existingValues[i];
    let value;
    if (optionId) {
      value = await RoutingRepository.toggleConditionOption({
        conditionId,
        optionId: references.options[optionId],
        checked: true
      });
    } else {
      let valueToUpdate = existingValue;
      if (!existingValue) {
        valueToUpdate = await RoutingRepository.createConditionValue({
          conditionId
        });
      }
      value = await RoutingRepository.updateConditionValue({
        ...valueToUpdate,
        customNumber
      });
    }
    values.push(value);
  }
  return values;
};

const buildConditions = async (
  conditionConfigs,
  ruleId,
  pageId,
  references
) => {
  let conditions = [];

  const existingConditions = await RoutingRepository.findAllRoutingConditions({
    routingRuleId: ruleId
  });
  for (let i = 0; i < conditionConfigs.length; ++i) {
    const { answerId, values, ...rest } = conditionConfigs[i];
    const existingCondition = existingConditions[i];

    if (existingCondition) {
      await RoutingRepository.removeRoutingCondition(existingCondition);
    }

    const condition = await RoutingRepository.createRoutingCondition({
      answerId: references.answers[answerId],
      questionPageId: pageId,
      routingRuleId: ruleId,
      comparator: rest.comparator || "Equal"
    });

    condition.values = await buildConditionValues(
      values,
      condition.id,
      references
    );

    conditions.push(condition);
  }

  return conditions;
};

const transformDestinationConfig = (
  { logicalDestination, sectionId, pageId },
  references
) => {
  if (logicalDestination) {
    return {
      logicalDestination: {
        destinationType: logicalDestination
      }
    };
  }

  let destinationType, destinationId;
  if (sectionId) {
    destinationType = "Section";
    destinationId = references.sections[sectionId];
  } else if (pageId) {
    destinationType = "QuestionPage";
    destinationId = references.pages[pageId];
  }

  return {
    absoluteDestination: {
      destinationType,
      destinationId
    }
  };
};

const buildRules = async (ruleConfigs, ruleSetId, pageId, references) => {
  let rules = [];
  const existingRules = await RoutingRepository.findAllRoutingRules({
    routingRuleSetId: ruleSetId
  });

  for (let i = 0; i < ruleConfigs.length; ++i) {
    const { goTo, conditions } = ruleConfigs[i];
    let existingRule = existingRules[i];
    if (!existingRule) {
      existingRule = await RoutingRepository.createRoutingRule({
        routingRuleSetId: ruleSetId
      });
    }

    const rule = await RoutingRepository.updateRoutingRule({
      id: existingRule.id,
      goto: {
        id: existingRule.routingDestinationId,
        ...transformDestinationConfig(goTo, references)
      }
    });

    rule.goTo = await RoutingRepository.getRoutingDestination(
      rule.routingDestinationId
    );

    rule.conditions = await buildConditions(
      conditions,
      rule.id,
      pageId,
      references
    );

    rules.push(rule);
  }

  return rules;
};

const buildRuleSet = async (ruleSetConfig, pageId, references) => {
  const ruleSet = await RoutingRepository.createRoutingRuleSet({
    questionPageId: pageId
  });

  const { else: elseConfig, rules } = ruleSetConfig;

  await RoutingRepository.updateRoutingRuleSet({
    id: ruleSet.id,
    else: {
      id: ruleSet.routingDestinationId,
      ...transformDestinationConfig(elseConfig, references)
    }
  });

  ruleSet.else = await RoutingRepository.getRoutingDestination(
    ruleSet.routingDestinationId
  );

  ruleSet.rules = await buildRules(rules, ruleSet.id, pageId, references);

  return ruleSet;
};

const buildQuestionnaire = async questionnaireConfig => {
  const { sections, metadata, ...questionnaireProps } = questionnaireConfig;

  const questionnaire = await QuestionnaireRepository.insert({
    title: "Test questionnaire",
    surveyId: "1",
    theme: "default",
    legalBasis: "Voluntary",
    navigation: false,
    createdBy: "foo",
    ...questionnaireProps
  });

  const references = {
    options: {},
    answers: {},
    pages: {},
    sections: {},
    metadata: {},
    pagesWithRouting: []
  };

  questionnaire.metadata = await buildMetadata(
    metadata,
    questionnaire,
    references
  );
  questionnaire.sections = await buildSections(
    sections,
    questionnaire,
    references
  );

  const buildRoutingActions = references.pagesWithRouting.map(
    async ({ page, pageConfig }) => {
      page.ruleSet = await buildRuleSet(
        pageConfig.ruleSet,
        page.id,
        references
      );
    }
  );

  await Promise.all(buildRoutingActions);

  return questionnaire;
};

module.exports = buildQuestionnaire;

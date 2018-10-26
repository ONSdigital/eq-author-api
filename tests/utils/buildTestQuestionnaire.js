const cheerio = require("cheerio");

const QuestionnaireRepository = require("../../repositories/QuestionnaireRepository");
const SectionRepository = require("../../repositories/SectionRepository");
const PageRepository = require("../../repositories/PageRepository");
const AnswerRepository = require("../../repositories/AnswerRepository");
const OptionRepository = require("../../repositories/OptionRepository");
const ValidationRepository = require("../../repositories/ValidationRepository");
const MetadataRepository = require("../../repositories/MetadataRepository");

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

const buildOptions = async (optionConfigs = [], answer) => {
  let options = [];
  const existingOptions = await OptionRepository.findAll({
    answerId: answer.id
  });
  for (let i = 0; i < optionConfigs.length; ++i) {
    const existingOption = existingOptions[i];
    const optionConfig = optionConfigs[i];

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
      pipeId,
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

    if (pipeId) {
      references.answers[pipeId] = answer.id;
    }

    answer.options = await buildOptions(options, answer);
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
    const { answers, ...pageConfig } = pageConfigs[i];
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

    page.answers = await buildAnswers(answers, page, references);

    pages.push(page);
  }

  return pages;
};

const buildSections = async (sectionConfigs, questionnaire, references) => {
  let sections = [];
  for (let i = 0; i < sectionConfigs.length; ++i) {
    const { pages, ...sectionConfig } = sectionConfigs[i];
    const section = await SectionRepository.insert({
      title: "Test section",
      description: "section description",
      ...sectionConfig,
      questionnaireId: questionnaire.id
    });

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
    const { pipeId, ...metadataConfig } = metadataConfigs[i];
    let metadata = await MetadataRepository.insert({
      questionnaireId: questionnaire.id
    });
    metadata = await MetadataRepository.update({
      ...metadataConfig,
      id: metadata.id
    });

    if (pipeId) {
      references.metadata[pipeId] = metadata.id;
    }

    metadatas.push(metadata);
  }

  return metadatas;
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
    answers: {},
    metadata: {}
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

  return questionnaire;
};

module.exports = buildQuestionnaire;

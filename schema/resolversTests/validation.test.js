const { first } = require("lodash");
const repositories = require("../../repositories");
const db = require("../../db");
const executeQuery = require("../../tests/utils/executeQuery");
const {
  createQuestionnaireMutation,
  createAnswerMutation,
  getAnswerValidations,
  toggleAnswerValidation,
  updateAnswerValidation
} = require("../../tests/utils/graphql");

const ctx = { repositories };

const createNewQuestionnaire = async () => {
  const input = {
    title: "Test Questionnaire",
    description: "Questionnaire created by integration test.",
    theme: "default",
    legalBasis: "Voluntary",
    navigation: false,
    surveyId: "001",
    summary: true,
    createdBy: "Integration test"
  };

  const result = await executeQuery(
    createQuestionnaireMutation,
    { input },
    ctx
  );
  return result.data.createQuestionnaire;
};

const createNewAnswer = async ({ id: pageId }, type) => {
  const input = {
    description: "",
    guidance: "",
    label: `${type} answer`,
    qCode: null,
    type: `${type}`,
    questionPageId: pageId
  };

  const result = await executeQuery(createAnswerMutation, { input }, ctx);
  return result.data.createAnswer;
};

const queryAnswerValidations = async id => {
  const result = await executeQuery(
    getAnswerValidations,
    {
      id
    },
    ctx
  );
  return result.data.answer.validation;
};

const mutateValidationToggle = async input => {
  const result = await executeQuery(
    toggleAnswerValidation,
    {
      input
    },
    ctx
  );

  return result.data.toggleValidationRule;
};

const mutateValidationParameters = async input => {
  const result = await executeQuery(
    updateAnswerValidation,
    {
      input
    },
    ctx
  );
  return result.data.updateValidationRule;
};

describe("resolvers", () => {
  let questionnaire;
  let sections;
  let pages;
  let firstPage;

  beforeAll(() => db.migrate.latest());
  afterAll(() => db.migrate.rollback().then(() => db.destroy()));
  afterEach(() => db("Questionnaires").delete());

  beforeEach(async () => {
    questionnaire = await createNewQuestionnaire();
    sections = questionnaire.sections;
    pages = first(sections).pages;
    firstPage = first(pages);
  });

  it("should create a min validation db entries for Currency and Number answers", async () => {
    const currencyAnswer = await createNewAnswer(firstPage, "Currency");
    const currencyValidation = await queryAnswerValidations(currencyAnswer.id);

    const numberAnswer = await createNewAnswer(firstPage, "Number");
    const numberValidation = await queryAnswerValidations(numberAnswer.id);

    const validationObject = id => ({
      minValue: {
        id,
        enabled: false,
        inclusive: false,
        custom: null
      }
    });

    expect(currencyValidation).toMatchObject(
      validationObject(currencyValidation.minValue.id)
    );
    expect(numberValidation).toMatchObject(
      validationObject(numberValidation.minValue.id)
    );
  });

  it("can toggle validation rule on and off", async () => {
    const currencyAnswer = await createNewAnswer(firstPage, "Currency");
    const currencyValidation = await queryAnswerValidations(currencyAnswer.id);

    const resultOn = await mutateValidationToggle({
      id: currencyValidation.minValue.id,
      enabled: true
    });

    expect(resultOn).toHaveProperty("enabled", true);

    const resultOff = await mutateValidationToggle({
      id: currencyValidation.minValue.id,
      enabled: false
    });

    expect(resultOff).toHaveProperty("enabled", false);
  });

  it("can update inclusive and custom values", async () => {
    const currencyAnswer = await createNewAnswer(firstPage, "Currency");
    const currencyValidation = await queryAnswerValidations(currencyAnswer.id);

    const result = await mutateValidationParameters({
      id: currencyValidation.minValue.id,
      minValueInput: {
        custom: 10,
        inclusive: true
      }
    });
    expect(result).toMatchObject({
      id: currencyValidation.minValue.id,
      custom: 10,
      inclusive: true
    });
  });
});

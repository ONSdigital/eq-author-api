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
  if (result.errors) {
    throw new Error(result.errors[0]);
  }
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
  if (result.errors) {
    throw new Error(result.errors[0]);
  }
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
  if (result.errors) {
    throw new Error(result.errors[0]);
  }
  return result.data.updateValidationRule;
};

describe("resolvers", () => {
  let questionnaire;
  let sections;
  let pages;
  let firstPage;

  beforeAll(() => db.migrate.latest());
  afterAll(() => db.destroy());
  afterEach(() => db("Questionnaires").delete());

  beforeEach(async () => {
    questionnaire = await createNewQuestionnaire();
    sections = questionnaire.sections;
    pages = first(sections).pages;
    firstPage = first(pages);
  });

  describe("All", () => {
    it("can toggle any validation rule on and off without affecting another", async () => {
      const currencyAnswer = await createNewAnswer(firstPage, "Currency");
      let currencyValidation = await queryAnswerValidations(currencyAnswer.id);

      await mutateValidationToggle({
        id: currencyValidation.minValue.id,
        enabled: true
      });

      currencyValidation = await queryAnswerValidations(currencyAnswer.id);

      expect(currencyValidation.minValue).toHaveProperty("enabled", true);
      expect(currencyValidation.maxValue).toHaveProperty("enabled", false);

      await mutateValidationToggle({
        id: currencyValidation.minValue.id,
        enabled: false
      });

      currencyValidation = await queryAnswerValidations(currencyAnswer.id);

      expect(currencyValidation.minValue).toHaveProperty("enabled", false);
      expect(currencyValidation.maxValue).toHaveProperty("enabled", false);
    });
  });

  describe("Number and Currency", () => {
    it("should create min and max validation db entries for Currency and Number answers", async () => {
      const currencyAnswer = await createNewAnswer(firstPage, "Currency");
      const currencyValidation = await queryAnswerValidations(
        currencyAnswer.id
      );

      const numberAnswer = await createNewAnswer(firstPage, "Number");
      const numberValidation = await queryAnswerValidations(numberAnswer.id);

      const validationObject = (minValueId, maxValueId) => ({
        minValue: {
          id: minValueId,
          enabled: false,
          inclusive: false,
          custom: null
        },
        maxValue: {
          id: maxValueId,
          enabled: false,
          inclusive: false,
          custom: null
        }
      });

      expect(currencyValidation).toMatchObject(
        validationObject(
          currencyValidation.minValue.id,
          currencyValidation.maxValue.id
        )
      );
      expect(numberValidation).toMatchObject(
        validationObject(
          numberValidation.minValue.id,
          numberValidation.maxValue.id
        )
      );
    });

    it("can update inclusive and custom min values", async () => {
      const currencyAnswer = await createNewAnswer(firstPage, "Currency");
      const currencyValidation = await queryAnswerValidations(
        currencyAnswer.id
      );

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

    it("can update inclusive and custom max values", async () => {
      const currencyAnswer = await createNewAnswer(firstPage, "Currency");
      const currencyValidation = await queryAnswerValidations(
        currencyAnswer.id
      );

      const result = await mutateValidationParameters({
        id: currencyValidation.maxValue.id,
        maxValueInput: {
          custom: 10,
          inclusive: true
        }
      });
      expect(result).toMatchObject({
        id: currencyValidation.maxValue.id,
        custom: 10,
        inclusive: true
      });
    });
  });

  describe("Date", () => {
    it("should create earliest validation db entries for Date answers", async () => {
      const answer = await createNewAnswer(firstPage, "Date");
      const validation = await queryAnswerValidations(answer.id);
      const validationObject = (earliestId, latestId) => ({
        earliestDate: {
          id: earliestId,
          enabled: false,
          offset: {
            value: 0,
            unit: "Days"
          },
          relativePosition: "Before",
          custom: null
        },
        latestDate: {
          id: latestId,
          offset: {
            value: 0,
            unit: "Days"
          },
          relativePosition: "After",
          custom: null
        }
      });

      expect(validation).toMatchObject(
        validationObject(validation.earliestDate.id, validation.latestDate.id)
      );
    });

    it("should be able to update earliest date properties", async () => {
      const answer = await createNewAnswer(firstPage, "Date");
      const validation = await queryAnswerValidations(answer.id);
      const result = await mutateValidationParameters({
        id: validation.earliestDate.id,
        earliestDateInput: {
          custom: "2017-01-01",
          offset: {
            value: 8,
            unit: "Months"
          },
          relativePosition: "After"
        }
      });
      const expected = {
        id: validation.earliestDate.id,
        customDate: "2017-01-01",
        offset: {
          value: 8,
          unit: "Months"
        },
        relativePosition: "After"
      };
      expect(result).toMatchObject(expected);
    });

    it("should be able to update latest date properties", async () => {
      const answer = await createNewAnswer(firstPage, "Date");
      const validation = await queryAnswerValidations(answer.id);
      const result = await mutateValidationParameters({
        id: validation.latestDate.id,
        latestDateInput: {
          custom: "2017-01-01",
          offset: {
            value: 8,
            unit: "Months"
          },
          relativePosition: "After"
        }
      });
      const expected = {
        id: validation.latestDate.id,
        customDate: "2017-01-01",
        offset: {
          value: 8,
          unit: "Months"
        },
        relativePosition: "After"
      };
      // When the objects don't match it can trigger a jest bug
      // https://github.com/facebook/jest/issues/6730
      expect(JSON.parse(JSON.stringify(result))).toMatchObject(expected);
    });
  });
});

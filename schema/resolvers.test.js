const { first } = require("lodash");
const repositories = require("../repositories");
const db = require("../db");
const executeQuery = require("../tests/utils/executeQuery");
const {
  createQuestionnaire,
  createAnswer,
  createOtherAnswer,
  deleteOtherAnswer,
  getAnswer,
  getAnswers
} = require("../tests/utils/graphql");

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

  const result = await executeQuery(createQuestionnaire, { input }, ctx);
  return result.data.createQuestionnaire;
};

const createNewAnswer = async ({ id: pageId }, type) => {
  const input = {
    description: "",
    guidance: "",
    label: `${type} answer`,
    qCode: null,
    type: `${type}`,
    mandatory: false,
    questionPageId: pageId
  };

  const result = await executeQuery(createAnswer, { input }, ctx);
  return result.data.createAnswer;
};

const createOtherAnswerMutation = async answer =>
  executeQuery(
    createOtherAnswer,
    { input: { parentAnswerId: answer.id } },
    ctx
  );

const createNewOtherAnswer = async answer => {
  const result = await createOtherAnswerMutation(answer);
  return result.data.createOtherAnswer;
};

const deleteOther = async answer =>
  executeQuery(
    deleteOtherAnswer,
    {
      input: {
        parentAnswerId: answer.id
      }
    },
    ctx
  );

const createThenDeleteOtherAnswer = async (page, type) => {
  const answer = await createNewAnswer(page, type);
  await createNewOtherAnswer(answer);
  await deleteOther(answer);

  return answer;
};

const refreshAnswerDetails = async ({ id }) => {
  const result = await executeQuery(getAnswer, { id }, ctx);

  return result.data.answer;
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

  it("should create other answer for Checkbox answers", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    expect(checkboxAnswer.other).toBeNull();

    const otherAnswer = await createNewOtherAnswer(checkboxAnswer);
    expect(otherAnswer).toMatchObject({ type: "TextField" });

    const updatedCheckboxAnswer = await refreshAnswerDetails(checkboxAnswer);
    expect(updatedCheckboxAnswer.other).not.toBeNull();
    expect(updatedCheckboxAnswer.other.answer).toMatchObject(otherAnswer);
  });

  it("should create other answer for Radio answers", async () => {
    const radioAnswer = await createNewAnswer(firstPage, "Radio");
    expect(radioAnswer.other).toBeNull();

    const otherAnswer = await createNewOtherAnswer(radioAnswer);
    expect(otherAnswer).toMatchObject({ type: "TextField" });

    const updatedRadioAnswer = await refreshAnswerDetails(radioAnswer);
    expect(updatedRadioAnswer.other).not.toBeNull();
    expect(updatedRadioAnswer.other.answer).toMatchObject(otherAnswer);
  });

  it("should throw error when creating other answer for BasicAnswer", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    const result = await createOtherAnswerMutation(textAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should throw error when deleting other answer for BasicAnswer", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    const result = await deleteOther(textAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should return undefined when accessing other property on BasicAnswers", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    expect(textAnswer.other).toBeUndefined();
  });

  it("should delete other answer for Checkbox answers", async () => {
    const parentAnswer = await createThenDeleteOtherAnswer(
      firstPage,
      "Checkbox"
    );
    const checkboxAnswer = await refreshAnswerDetails(parentAnswer);

    expect(checkboxAnswer.other).toBeNull();
  });

  it("should delete other answer for Radio answers", async () => {
    const parentAnswer = await createThenDeleteOtherAnswer(firstPage, "Radio");
    const radioAnswer = await refreshAnswerDetails(parentAnswer);

    expect(radioAnswer.other).toBeNull();
  });

  it("should not create a new otherAnswer if one already exists", async () => {
    const parentAnswer = await createNewAnswer(firstPage, "Checkbox");
    const otherAnswer = await createNewOtherAnswer(parentAnswer);

    expect(createNewOtherAnswer(parentAnswer)).resolves.toBeNull();

    const updatedParent = await refreshAnswerDetails(parentAnswer);
    expect(updatedParent.other.answer).toMatchObject(otherAnswer);
  });

  it("should filter out Other answers from regular answers", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createNewOtherAnswer(checkboxAnswer);

    const textFieldAnswer = await createNewAnswer(firstPage, "TextField");

    const result = await executeQuery(getAnswers, { id: firstPage.id }, ctx);
    expect(result.data.page.answers).toHaveLength(2);
    expect(result.data.page.answers).toContainEqual({
      id: checkboxAnswer.id,
      type: checkboxAnswer.type
    });
    expect(result.data.page.answers).toContainEqual({
      id: textFieldAnswer.id,
      type: textFieldAnswer.type
    });
  });

  it("should create an other option while creating an other answer", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createNewOtherAnswer(checkboxAnswer);
    const refreshedCheckbox = await refreshAnswerDetails(checkboxAnswer);
    expect(refreshedCheckbox.other.option).not.toBeNull();
    expect(refreshedCheckbox.other.option).toHaveProperty("id");
  });

  it("should not return 'other' option with regular checkbox/radio options", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createNewOtherAnswer(checkboxAnswer);
    const refreshedCheckbox = await refreshAnswerDetails(checkboxAnswer);
    expect(refreshedCheckbox.options).toHaveLength(1);
    expect(refreshedCheckbox.options).not.toContainEqual({
      id: refreshedCheckbox.other.option.id
    });
  });

  it("should return an error when trying to delete a non-existent other Answer", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    const result = await deleteOther(checkboxAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should return an error when trying to create other answer when one already exists", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    const firstAttempt = await createOtherAnswerMutation(checkboxAnswer);
    const secondAttempt = await createOtherAnswerMutation(checkboxAnswer);

    expect(firstAttempt).not.toHaveProperty("errors");

    expect(secondAttempt).toHaveProperty("errors");
    expect(secondAttempt.errors).toHaveLength(1);
  });
});

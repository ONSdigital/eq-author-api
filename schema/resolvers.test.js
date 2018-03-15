const repositories = require("../repositories");
const db = require("../db");
const executeQuery = require("../tests/utils/executeQuery");
const {
  createQuestionnaire,
  createAnswer,
  createOtherAnswer,
  deleteOtherAnswer,
  getAnswer
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

const createNewAnswer = async (pageId, type) => {
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

const createNewOtherAnswer = async answer => {
  const result = await executeQuery(
    createOtherAnswer,
    { input: { parentAnswerId: answer.id } },
    ctx
  );
  return result.data.createOtherAnswer;
};

const createThenDeleteOtherAnswer = async (pageId, type) => {
  const answer = await createNewAnswer(pageId, type);
  await createNewOtherAnswer(answer);
  await executeQuery(
    deleteOtherAnswer,
    {
      input: {
        parentAnswerId: answer.id
      }
    },
    ctx
  );

  return answer;
};

const refreshAnswerDetails = async answerId => {
  const result = await executeQuery(getAnswer, { id: answerId }, ctx);

  return result.data.answer;
};

describe("resolvers", () => {
  let questionnaire;
  let sections;
  let pages;

  beforeAll(() => db.migrate.latest());
  afterAll(() => db.migrate.rollback().then(() => db.destroy()));
  afterEach(() => db("Questionnaires").delete());

  beforeEach(async () => {
    questionnaire = await createNewQuestionnaire();
    sections = questionnaire.sections;
    pages = sections[0].pages;
  });

  it("should create other answer for Checkbox answers", async () => {
    const checkboxAnswer = await createNewAnswer(pages[0].id, "Checkbox");
    expect(checkboxAnswer.otherAnswer).toBeNull();

    const otherAnswer = await createNewOtherAnswer(checkboxAnswer);
    expect(otherAnswer).toMatchObject({ type: "TextField" });

    const updatedCheckboxAnswer = await refreshAnswerDetails(checkboxAnswer.id);
    expect(updatedCheckboxAnswer.otherAnswer).not.toBeNull();
    expect(updatedCheckboxAnswer.otherAnswer).toMatchObject(otherAnswer);
  });

  it("should create other answer for Radio answers", async () => {
    const radioAnswer = await createNewAnswer(pages[0].id, "Radio");
    expect(radioAnswer.otherAnswer).toBeNull();

    const otherAnswer = await createNewOtherAnswer(radioAnswer);
    expect(otherAnswer).toMatchObject({ type: "TextField" });

    const updatedRadioAnswer = await refreshAnswerDetails(radioAnswer.id);
    expect(updatedRadioAnswer.otherAnswer).not.toBeNull();
    expect(updatedRadioAnswer.otherAnswer).toMatchObject(otherAnswer);
  });

  it("should not create other answer for BasicAnswers", async () => {
    const textAnswer = await createNewAnswer(pages[0].id, "TextField");
    expect(textAnswer.otherAnswer).toBeUndefined();

    const otherAnswer = await createNewOtherAnswer(textAnswer);
    expect(otherAnswer).toBeNull();

    const updatedTextAnswer = await refreshAnswerDetails(textAnswer.id);
    expect(updatedTextAnswer.otherAnswer).toBeUndefined();
  });

  it("should delete other answer for Checkbox answers", async () => {
    const parentAnswer = await createThenDeleteOtherAnswer(
      pages[0].id,
      "Checkbox"
    );
    const checkboxAnswer = await refreshAnswerDetails(parentAnswer.id);

    expect(checkboxAnswer.otherAnswer).toBeNull();
  });

  it("should delete other answer for Radio answers", async () => {
    const parentAnswer = await createThenDeleteOtherAnswer(
      pages[0].id,
      "Radio"
    );
    const radioAnswer = await refreshAnswerDetails(parentAnswer.id);

    expect(radioAnswer.otherAnswer).toBeNull();
  });

  it("should not break when deleting other answer for BasicAnswers", async () => {
    const parentAnswer = await createThenDeleteOtherAnswer(
      pages[0].id,
      "TextField"
    );
    const textAnswer = await refreshAnswerDetails(parentAnswer.id);

    expect(textAnswer.parentAnswerId).toBeUndefined();
  });

  it("should not create a new otherAnswer if one already exists", async () => {
    const parentAnswer = await createNewAnswer(pages[0].id, "Checkbox");
    const otherAnswer = await createNewOtherAnswer(parentAnswer);

    expect(createNewOtherAnswer(parentAnswer)).resolves.toBeNull();

    const updatedParent = await refreshAnswerDetails(parentAnswer.id);
    expect(updatedParent.otherAnswer).toMatchObject(otherAnswer);
  });
});

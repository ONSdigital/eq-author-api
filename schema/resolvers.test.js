const repositories = require("../repositories");
const db = require("../db");
const executeQuery = require("../tests/utils/executeQuery");
const {
  createQuestionnaire,
  createAnswer,
  createOtherAnswer,
  deleteOtherAnswer
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
  let answer = await createNewAnswer(pageId, type);
  answer = await createNewOtherAnswer(answer);

  const result = await executeQuery(
    deleteOtherAnswer,
    {
      input: {
        parentAnswerId: answer.id
      }
    },
    ctx
  );

  return result.data.deleteOtherAnswer;
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

  it("should create other answer for Checkbox answers", async done => {
    let checkboxAnswer = await createNewAnswer(pages[0].id, "Checkbox");
    expect(checkboxAnswer.otherAnswer).toBeNull();

    checkboxAnswer = await createNewOtherAnswer(checkboxAnswer);

    expect(checkboxAnswer.otherAnswer).not.toBeNull();
    expect(checkboxAnswer.otherAnswer).toMatchObject({
      type: "TextField"
    });
    done();
  });

  it("should create other answer for Radio answers", async done => {
    let radioAnswer = await createNewAnswer(pages[0].id, "Radio");
    expect(radioAnswer.otherAnswer).toBeNull();

    radioAnswer = await createNewOtherAnswer(radioAnswer);

    expect(radioAnswer.otherAnswer).not.toBeNull();
    expect(radioAnswer.otherAnswer).toMatchObject({
      type: "TextField"
    });
    done();
  });

  it("should not create other answer for BasicAnswers", async done => {
    let textAnswer = await createNewAnswer(pages[0].id, "TextField");
    expect(textAnswer.otherAnswer).toBeUndefined();

    textAnswer = await createNewOtherAnswer(textAnswer);

    expect(textAnswer.otherAnswer).toBeUndefined();
    done();
  });

  it("should delete other answer for Checkbox answers", async done => {
    const checkboxAnswer = await createThenDeleteOtherAnswer(
      pages[0].id,
      "Checkbox"
    );

    expect(checkboxAnswer.otherAnswer).toBeNull();
    done();
  });

  it("should delete other answer for Radio answers", async done => {
    const radioAnswer = await createThenDeleteOtherAnswer(pages[0].id, "Radio");

    expect(radioAnswer.otherAnswer).toBeNull();
    done();
  });

  it("should not break when deleting other answer for BasicAnswers", async done => {
    const radioAnswer = await createThenDeleteOtherAnswer(
      pages[0].id,
      "TextField"
    );

    expect(radioAnswer.otherAnswerId).toBeUndefined();
    done();
  });

  it("should not create a new otherAnswer if one already exists", async done => {
    let checkboxAnswer = await createNewAnswer(pages[0].id, "Checkbox");
    checkboxAnswer = await createNewOtherAnswer(checkboxAnswer);

    const originalOtherAnswerId = checkboxAnswer.otherAnswer.id;

    checkboxAnswer = await createNewOtherAnswer(checkboxAnswer);

    const newOtherAnswerId = checkboxAnswer.otherAnswer.id;
    expect(newOtherAnswerId).toEqual(originalOtherAnswerId);

    done();
  });
});

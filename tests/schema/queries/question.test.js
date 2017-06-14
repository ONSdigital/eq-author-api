const findFixture = require("../../utils/findFixture");
const executeQuery = require("../../utils/executeQuery");

describe("Question query" , () => {

  const question = `
    query GetQuestion($id: ID!) {
      question(id: $id) {
        id,
        title,
        description,
        guidance,
        type,
        mandatory,
        PageId
      }
    }
  `;

  const questionWithAnswers = `
    query GetQuestionWithAnswers($id: ID!) {
      question(id: $id) {
        id,
        answers {
          id
        }
      }
    }
  `;

  it("should fetch question by id", async () => {
    const result = await executeQuery(question, { id : 1 });
    const expected = expect.objectContaining(findFixture("Question", 1));

    expect(result.question).toEqual(expected);
  });

  it("should return null if no matching question", async () => {
    const result = await executeQuery(question, { id: -10 });
    const expected = null;

    expect(result.question).toEqual(expected);
  });

  it("should have an association with questions", async () => {
    const result = await executeQuery(questionWithAnswers, { id: 1 });
    const expected = expect.objectContaining({
      id : 1,
      answers : [{ id : 1 }, { id : 2 }]
    });

    expect(result.question).toEqual(expected);
  });
});
const findFixture = require("../../utils/findFixture");
const executeQuery = require("../../utils/executeQuery");

describe("answer query" , () => {

  const answer = `
    query GetAnswer($id: Int!) {
      answer(id: $id) {
        id,
        description,
        guidance,
        label,
        mandatory,
        type,
        QuestionId
      }
    }
  `;

  it("should fetch answer by id", async () => {
    const result = await executeQuery(answer, { id : 1 });
    const expected = expect.objectContaining(findFixture("Answer", 1));

    expect(result.answer).toEqual(expected);
  });

  it("should return null if no matching answer", async () => {
    const result = await executeQuery(answer, { id :-10 });
    const expected = null;

    expect(result.answer).toEqual(expected);
  });
});
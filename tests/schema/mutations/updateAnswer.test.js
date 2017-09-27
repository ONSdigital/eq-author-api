const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateAnswer", () => {
  const updateAnswer = `
    mutation UpdateAnswer($input: UpdateAnswerInput!) {
      updateAnswer(input: $input) {
        id,
        description,
        guidance,
        qCode,
        label,
        type
        mandatory
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Answer: mockRepository()
    };
  });

  it("should allow update of Answer", async () => {
    const input = {
      id: "1",
      description: "This is an updated answer description",
      guidance: "This is an update answer guidance",
      qCode: "123",
      label: "updated test answer",
      type: "Date",
      mandatory: false
    };

    const result = await executeQuery(
      updateAnswer,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.update).toHaveBeenCalledWith(input);
  });
});

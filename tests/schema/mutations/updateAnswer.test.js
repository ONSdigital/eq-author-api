const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateAnswer" , () => {

  const updateAnswer = `
    mutation UpdateAnswer(
      $id: Int!,
      $description: String,
      $guidance: String,
      $qCode: String,
      $label: String,
      $type: AnswerType!,
      $mandatory: Boolean
    ) {
      updateAnswer(
        id: $id,
        description: $description,
        guidance: $guidance,
        qCode: $qCode,
        label: $label,
        type: $type,
        mandatory: $mandatory,
      ) {
        id,
        description,
        guidance,
        qCode,
        label,
        type
        mandatory
        QuestionPageId
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Answer : mockRepository()
    }
  });

  it("should allow update of Answer", async () => {
    const fixture = {
      id: 1,
      description: "This is an updated answer description",
      guidance: "This is an update answer guidance",
      qCode: "123",
      label: "updated test answer",
      type: "Date",
      mandatory: false
    };

    const result = await executeQuery(updateAnswer, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.update).toHaveBeenCalled();
  });
});
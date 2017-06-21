const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createAnswer" , () => {

  const createAnswer = `
    mutation CreateAnswer(
      $description:String,
      $guidance:String,
      $qCode: String,
      $label:String,
      $type:String!,
      $mandatory:Boolean!,
      $questionId:Int!
    ) {
      createAnswer(
        description: $description,
        guidance: $guidance,
        qCode: $qCode,
        label: $label,
        type: $type,
        mandatory: $mandatory,
        questionId:$questionId
      ) {
        id,
        description,
        guidance,
        qCode,
        label,
        type,
        mandatory,
        QuestionId
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Answer : mockRepository("question")
    };
  });

  it("should allow creation of Answer", async () => {
    const fixture = {
      title: "Test answer",
      description: "Test answer description",
      guidance: "Test answer guidance",
      type: "TextField",
      mandatory: false,
      questionId: 1
    };

    const result = await executeQuery(createAnswer, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.insert).toHaveBeenCalled();
  });
});
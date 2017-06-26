const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createQuestion" , () => {

  const createQuestion = `
    mutation CreateQuestion(
      $title: String!,
      $description: String!,
      $guidance: String!,
      $type: QuestionType!,
      $mandatory: Boolean,
      $GroupId: Int!
    ) {
      createQuestion(
        title: $title,
        description: $description,
        guidance: $guidance,
        type: $type,
        mandatory: $mandatory,
        GroupId: $GroupId
      ) {
        id,
        title,
        description,
        guidance,
        type,
        mandatory,
        GroupId
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Question : mockRepository()
    };
  });


  it("should allow creation of Question", async () => {
    const fixture = {
      title: "Test question",
      description: "Test question description",
      guidance: "Test question guidance",
      type: "General",
      mandatory: true,
      GroupId: 1
    };

    const result = await executeQuery(createQuestion, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Question.insert).toHaveBeenCalled();
  });
});
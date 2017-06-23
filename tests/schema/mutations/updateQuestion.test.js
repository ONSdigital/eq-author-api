const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateQuestion" , () => {

  const updateQuestion = `
    mutation UpdateQuestion(
      $id: Int!,
      $title:String!,
      $description: String!,
      $guidance: String!,
      $type: String!,
      $mandatory: Boolean
    ) {
      updateQuestion(
        id:$id,
        title:$title,
        description: $description,
        guidance:$guidance,
        type: $type,
        mandatory: $mandatory
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
    }
  });

  it("should allow update of Question", async () => {
    const fixture = {
      id: 1,
      title: "Updated question title",
      description: "This is an updated question description",
      guidance: "Updated question description",
      type: "DateRange",
      mandatory: false
    };

    const result = await executeQuery(updateQuestion, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Question.update).toHaveBeenCalled();
  });
});
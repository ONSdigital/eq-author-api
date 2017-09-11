const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateQuestionPage", () => {
  const updateQuestionPage = `
    mutation UpdateQuestionPage(
      $id: Int!,
      $title: String!,
      $description: String!,
      $guidance: String!
    ) {
      updateQuestionPage(
        id: $id,
        title: $title,
        description: $description,
        guidance: $guidance
      ) {
        id,
        title,
        description,
        guidance
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      QuestionPage: mockRepository()
    };
  });

  it("should allow update of Question", async () => {
    const fixture = {
      id: 1,
      title: "Updated question title",
      description: "This is an updated question description",
      guidance: "Updated question description"
    };

    const result = await executeQuery(updateQuestionPage, fixture, {
      repositories
    });

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.update).toHaveBeenCalled();
  });
});

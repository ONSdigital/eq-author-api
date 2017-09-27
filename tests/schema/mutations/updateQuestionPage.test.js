const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateQuestionPage", () => {
  const updateQuestionPage = `
    mutation UpdateQuestionPage($input: UpdateQuestionPageInput!) {
      updateQuestionPage(input: $input) {
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
    const input = {
      id: "1",
      title: "Updated question title",
      description: "This is an updated question description",
      guidance: "Updated question description"
    };

    const result = await executeQuery(
      updateQuestionPage,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.update).toHaveBeenCalledWith(input);
  });
});

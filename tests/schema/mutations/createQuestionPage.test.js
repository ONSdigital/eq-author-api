const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createQuestionPage", () => {
  const createQuestionPage = `
    mutation CreateQuestionPage(
      $title: String!,
      $description: String!,
      $guidance: String!,
      $sectionId: Int!
    ) {
      createQuestionPage(
        title: $title,
        description: $description,
        guidance: $guidance,
        sectionId: $sectionId
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

  it("should allow creation of Question", async () => {
    const fixture = {
      title: "Test question",
      description: "Test question description",
      guidance: "Test question guidance",
      sectionId: 1
    };

    const result = await executeQuery(createQuestionPage, fixture, {
      repositories
    });

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.insert).toHaveBeenCalled();
  });
});

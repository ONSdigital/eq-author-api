const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createQuestionPage", () => {
  const createQuestionPage = `
    mutation CreateQuestionPage(
      $title: String!,
      $description: String!,
      $guidance: String!,
      $type: QuestionType!,
      $sectionId: Int!
    ) {
      createQuestionPage(
        title: $title,
        description: $description,
        guidance: $guidance,
        type: $type,
        sectionId: $sectionId
      ) {
        id,
        title,
        description,
        guidance,
        type
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
      type: "General",
      sectionId: 1
    };

    const result = await executeQuery(createQuestionPage, fixture, {
      repositories
    });

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.insert).toHaveBeenCalled();
  });
});

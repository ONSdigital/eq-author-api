const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createPage", () => {
  const createPage = `
    mutation CreatePage(
      $title: String!,
      $description: String,
      $sectionId: Int!
    ) {
      createPage(
        title: $title,
        description: $description,
        sectionId: $sectionId
      ) {
        id,
        title,
        description,
        sectionId
        ... on QuestionPage {
          guidance
        }
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Page: mockRepository()
    };
  });

  it("should allow creation of Page", async () => {
    const fixture = {
      title: "Test page",
      description: "Test page description",
      sectionId: 1
    };

    const result = await executeQuery(createPage, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.insert).toHaveBeenCalled();
  });
});

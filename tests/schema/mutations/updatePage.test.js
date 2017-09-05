const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updatePage", () => {
  const updatePage = `
    mutation UpdatePage(
      $id: Int!,
      $title: String!,
      $description: String!
    ) {
      updatePage(
        id: $id,
        title: $title,
        description: $description,
      ) {
        id,
        title,
        description,
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

  it("should allow update of Page", async () => {
    const fixture = {
      id: 1,
      title: "Updated page title",
      description: "This is an updated page description"
    };

    const result = await executeQuery(updatePage, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.update).toHaveBeenCalled();
  });
});

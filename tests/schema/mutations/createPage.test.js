const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createPage" , () => {

  const createPage = `
    mutation CreatePage(
      $title: String!,
      $description: String,
      $groupId: Int!
    ) {
      createPage(
        title: $title,
        description: $description,
        groupId: $groupId
      ) {
        id,
        title,
        description,
        groupId
        ... on QuestionPage {
          guidance
        }
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Page : mockRepository()
    };
  });

  it("should allow creation of Page", async () => {
    const fixture = {
      "title": "Test page",
      "description": "Test page description",
      "groupId": 1
    };

    const result = await executeQuery(createPage, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.insert).toHaveBeenCalled();
  });
});
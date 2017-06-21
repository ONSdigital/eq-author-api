const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createPage" , () => {

  const createPage = `
    mutation CreatePage(
      $title: String!,
      $description: String,
      $questionnaireId:Int!
    ) {
      createPage(
        title:$title,
        description:$description,
        questionnaireId:$questionnaireId
      ) {
        id,
        title,
        description,
        QuestionnaireId
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
      "questionnaireId": 1
    };

    const result = await executeQuery(createPage, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.insert).toHaveBeenCalled();
  });
});
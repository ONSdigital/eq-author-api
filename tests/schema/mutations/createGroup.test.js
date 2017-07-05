const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createGroup" , () => {

  const createGroup = `
    mutation CreateGroup(
      $title: String!,
      $description: String,
      $questionnaireId: Int!
    ) {
      createGroup(
        title: $title,
        description: $description,
        questionnaireId: $questionnaireId
      ) {
        id,
        title
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Group : mockRepository()
    };
  });

  it("should allow creation of Group", async () => {
    const fixture = {
      "title": "Test group",
      "description": "Test group description",
      "questionnaireId": 1
    };

    const result = await executeQuery(createGroup, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Group.insert).toHaveBeenCalled();
  });
});
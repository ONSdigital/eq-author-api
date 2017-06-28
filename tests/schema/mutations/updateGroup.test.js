const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateGroup" , () => {

  const updateGroup = `
    mutation UpdateGroup(
      $id: Int!,
      $title: String!,
      $description: String!
    ) {
      updateGroup(
        id: $id,
        title: $title,
        description: $description,
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
    }
  });

  it("should allow update of Group", async () => {
    const fixture = {
      id: 1,
      title: "Updated group title",
      description: "This is an updated group description"
    };

    const result = await executeQuery(updateGroup, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Group.update).toHaveBeenCalled();
  });
});
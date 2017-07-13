const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateSection", () => {
  const updateSection = `
    mutation UpdateSection(
      $id: Int!,
      $title: String!,
      $description: String!
    ) {
      updateSection(
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
      Section: mockRepository()
    };
  });

  it("should allow update of Section", async () => {
    const fixture = {
      id: 1,
      title: "Updated section title",
      description: "This is an updated section description"
    };

    const result = await executeQuery(updateSection, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalled();
  });
});

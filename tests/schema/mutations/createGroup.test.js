const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createSection", () => {
  const createSection = `
    mutation CreateSection(
      $title: String!,
      $description: String,
      $questionnaireId: Int!
    ) {
      createSection(
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
      Section: mockRepository()
    };
  });

  it("should allow creation of Section", async () => {
    const fixture = {
      title: "Test section",
      description: "Test section description",
      questionnaireId: 1
    };

    const result = await executeQuery(createSection, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.insert).toHaveBeenCalled();
  });
});

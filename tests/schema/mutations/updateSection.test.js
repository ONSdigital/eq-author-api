const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateSection", () => {
  const updateSection = `
    mutation UpdateSection($input: UpdateSectionInput!) {
      updateSection(input: $input) {
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
    const input = {
      id: "1",
      title: "Updated section title",
      description: "This is an updated section description"
    };

    const result = await executeQuery(
      updateSection,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith(input);
  });
});

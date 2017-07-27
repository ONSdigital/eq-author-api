const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteSection", () => {
  const deleteSection = `
    mutation DeleteSection($id:Int!) {
      deleteSection(id:$id) {
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Section: mockRepository()
    };
  });

  it("should allow deletion of Section", async () => {
    const result = await executeQuery(
      deleteSection,
      { id: 1 },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.remove).toHaveBeenCalledWith(1);
  });
});

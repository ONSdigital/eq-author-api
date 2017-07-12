const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Section query", () => {
  const section = `
    query GetSection($id: Int!) {
      section(id: $id) {
        id,
        title,
        description
      }
    }
  `;

  const sectionWithPages = `
    query GetSection($id: Int!) {
      section(id: $id) {
        id,
        title,
        description,
        pages {
          id
        }
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      Section: mockRepository(),
      Page: mockRepository()
    };
  });

  it("should fetch page by id", async () => {
    const result = await executeQuery(section, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Pages", async () => {
    repositories.Section.get.mockImplementation(() => ({
      id,
      title: "test section title"
    }));

    const result = await executeQuery(
      sectionWithPages,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).toHaveBeenCalledWith({ SectionId: id });
  });
});

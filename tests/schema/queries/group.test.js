const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Group query" , () => {

  const group = `
    query GetGroup($id: Int!) {
      group(id: $id) {
        id,
        title,
        description
      }
    }
  `;

  const groupWithPages = `
    query GetGroup($id: Int!) {
      group(id: $id) {
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
      Group : mockRepository(),
      Page : mockRepository()
    }
  });

  it("should fetch page by id", async () => {
    const result = await executeQuery(group, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Group.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Pages", async () => {
    repositories.Group.get.mockImplementation(() => ({ id, title : "test group title" }));

    const result = await executeQuery(groupWithPages, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Group.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).toHaveBeenCalledWith({ GroupId : id });
  });
});
const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deletePage" , () => {

  const deletePage = `
    mutation DeletePage($id:Int!) {
      deletePage(id:$id) {
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Page : mockRepository()
    }
  });

  it("should allow deletion of Page", async () => {
    const result = await executeQuery(deletePage, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.remove).toHaveBeenCalled();
  });
});
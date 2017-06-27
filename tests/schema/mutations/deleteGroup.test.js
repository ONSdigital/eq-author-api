const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteGroup" , () => {

  const deleteGroup = `
    mutation DeleteGroup($id:Int!) {
      deleteGroup(id:$id) {
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Group : mockRepository()
    }
  });

  it("should allow deletion of Group", async () => {
    const result = await executeQuery(deleteGroup, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Group.remove).toHaveBeenCalledWith(1);
  });
});
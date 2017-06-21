const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteAnswer" , () => {

  const deleteAnswer = `
    mutation DeleteAnswer($id:Int!) {
      deleteAnswer(id:$id){
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Answer : mockRepository()
    }
  });

  it("should allow deletion of Answer", async () => {
    const result = await executeQuery(deleteAnswer, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.remove).toHaveBeenCalled();
  });
});
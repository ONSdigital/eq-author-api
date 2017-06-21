const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteQuestion" , () => {

  const deleteQuestion = `
    mutation DeleteQuestion($id:Int!) {
      deleteQuestion(id:$id){
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Question : mockRepository()
    }
  });

  it("should allow deletion of Question", async () => {
    const result = await executeQuery(deleteQuestion, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Question.remove).toHaveBeenCalled();
  });
});
const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteQuestionPage" , () => {

  const deleteQuestionPage = `
    mutation DeleteQuestionPage($id:Int!) {
      deleteQuestionPage(id:$id){
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      QuestionPage : mockRepository()
    }
  });

  it("should allow deletion of Question", async () => {
    const result = await executeQuery(deleteQuestionPage, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.remove).toHaveBeenCalled();
  });
});
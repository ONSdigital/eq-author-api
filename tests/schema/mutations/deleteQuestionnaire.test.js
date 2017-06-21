const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("deleteQuestionnaire" , () => {

  const deleteQuestionnaire = `
    mutation DeleteQuestionnaire($id:Int!) {
      deleteQuestionnaire(id:$id){
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Questionnaire : mockRepository()
    }
  });

  it("should allow deletion of Questionnaire", async () => {
    const result = await executeQuery(deleteQuestionnaire, { id : 1 }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.remove).toHaveBeenCalled();
  });
});
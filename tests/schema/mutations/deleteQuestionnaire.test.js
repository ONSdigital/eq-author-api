const { Questionnaire } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("deleteQuestionnaire" , () => {

  const deleteQuestionnaire = `
    mutation DeleteQuestionnaire($id:ID!) {
      deleteQuestionnaire(id:$id){
        id
      }
    }
  `;

  it("should allow deletion of Questionnaire", async () => {
    const result = await executeQuery(deleteQuestionnaire, { id : 1 });
    const expected = await Questionnaire.findById(result.deleteQuestionnaire.id);

    expect(expected).toEqual(null);
  });
});
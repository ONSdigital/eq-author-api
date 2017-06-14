const { Question } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("deleteQuestion" , () => {

  const deleteQuestion = `
    mutation DeleteQuestion($id:ID!) {
      deleteQuestion(id:$id){
        id
      }
    }
  `;

  it("should allow deletion of Question", async () => {
    const result = await executeQuery(deleteQuestion, { id : 1 });
    const expected = await Question.findById(result.deleteQuestion.id);

    expect(expected).toEqual(null);
  });
});
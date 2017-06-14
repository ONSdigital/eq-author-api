const { Answer } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("deleteAnswer" , () => {

  const deleteAnswer = `
    mutation DeleteAnswer($id:ID!) {
      deleteAnswer(id:$id){
        id
      }
    }
  `;

  it("should allow deletion of Answer", async () => {
    const result = await executeQuery(deleteAnswer, { id : 1 });
    const expected = await Answer.findById(result.deleteAnswer.id);

    expect(expected).toEqual(null);
  });
});
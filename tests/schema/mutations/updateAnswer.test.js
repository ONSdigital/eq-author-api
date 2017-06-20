const { Answer } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("updateAnswer" , () => {

  const updateAnswer = `
    mutation UpdateAnswer(
      $id:Int!,
      $description:String,
      $guidance:String,
      $qCode: String,
      $label:String,
      $type:String!,
      $mandatory:Boolean
    ) {
      updateAnswer(
        id:$id,
        description: $description,
        guidance: $guidance,
        qCode: $qCode,
        label: $label,
        type: $type,
        mandatory: $mandatory,
      ) {
        id,
        description,
        guidance,
        qCode,
        label,
        type
        mandatory
        QuestionId
      }
    }
  `;

  it("should allow update of Answer", async () => {
    const fixture = {
      id: 1,
      description: "This is an updated answer description",
      guidance: "This is an update answer guidance",
      qCode: "123",
      label: "updated test answer",
      type: "Date",
      mandatory: false
    };

    const result = await executeQuery(updateAnswer, fixture);
    const expected = await Answer.findById(result.updateAnswer.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.updateAnswer));
  });
});
const { Question } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("updateQuestion" , () => {

  const updateQuestion = `
    mutation UpdateQuestion(
      $id: ID!,
      $title:String!,
      $description: String!,
      $guidance: String!,
      $type: String!,
      $mandatory: Boolean
    ) {
      updateQuestion(
        id:$id,
        title:$title,
        description: $description,
        guidance:$guidance,
        type: $type,
        mandatory: $mandatory
      ) {
        id,
        title,
        description,
        guidance,
        type,
        mandatory,
        PageId
      }
    }
  `;

  it("should allow update of Question", async () => {
    const fixture = {
      id: 1,
      title: "Updated question title",
      description: "This is an updated question description",
      guidance: "Updated question description",
      type: "DateRange",
      mandatory: false
    };

    const result = await executeQuery(updateQuestion, fixture);
    const expected = await Question.findById(result.updateQuestion.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.updateQuestion));
  });
});
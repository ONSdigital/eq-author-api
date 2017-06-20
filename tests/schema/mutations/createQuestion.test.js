const { Question } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("createQuestion" , () => {

  const createQuestion = `
    mutation CreateQuestion(
      $title:String!,
      $description: String!,
      $guidance: String!,
      $type: String!,
      $mandatory: Boolean,
      $pageId: Int!
    ) {
      createQuestion(
        title:$title,
        description: $description,
        guidance:$guidance,
        type: $type,
        mandatory: $mandatory,
        pageId: $pageId
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

  it("should allow creation of Question", async () => {
    const fixture = {
      title: "Test question",
      description: "Test question description",
      guidance: "Test question guidance",
      type: "General",
      mandatory: true,
      pageId: 1
    };

    const result = await executeQuery(createQuestion, fixture);
    const expected = await Question.findById(result.createQuestion.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.createQuestion));
  });
});
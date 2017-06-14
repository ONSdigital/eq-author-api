const { Page } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("createPage" , () => {

  const createPage = `
    mutation CreatePage(
      $title: String!,
      $description: String!,
      $questionnaireId:ID!
    ) {
      createPage(
        title:$title,
        description:$description,
        questionnaireId:$questionnaireId
      ) {
        id,
        title,
        description,
        QuestionnaireId
      }
    }
  `;

  it("should allow creation of Page", async () => {
    const fixture = {
      "title": "Test page",
      "description": "Test page description",
      "questionnaireId": 1
    };

    const result = await executeQuery(createPage, fixture);
    const expected = await Page.findById(result.createPage.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.createPage));
  });
});
const { Page } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("updatePage" , () => {

  const updatePage = `
    mutation UpdatePage(
      $id:Int!,
      $title: String!,
      $description: String!
    ) {
      updatePage(
        id:$id,
        title:$title,
        description:$description,
      ) {
        id,
        title,
        description
      }
    }
  `;

  it("should allow update of Page", async () => {
    const fixture = {
      id: 1,
      title: "Updated page title",
      description: "This is an updated page description"
    };

    const result = await executeQuery(updatePage, fixture);
    const expected = await Page.findById(result.updatePage.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.updatePage));
  });
});
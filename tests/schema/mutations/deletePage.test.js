const { Page } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("deletePage" , () => {

  const deletePage = `
    mutation DeletePage($id:ID!) {
      deletePage(id:$id){
        id
      }
    }
  `;

  it("should allow deletion of Page", async () => {
    const result = await executeQuery(deletePage, { id : 1 });
    const expected = await Page.findById(result.deletePage.id);

    expect(expected).toEqual(null);
  });
});
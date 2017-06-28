const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Page query" , () => {

  const page = `
    query GetPage($id: Int!) {
      page(id: $id) {
        id,
        title,
        description,
        groupId
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      Page : mockRepository(),
      QuestionPage : mockRepository()
    }
  });

  it("should fetch page by id", async () => {
    const result = await executeQuery(page, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.get).toHaveBeenCalledWith(id);
    expect(repositories.QuestionPage.findAll).not.toHaveBeenCalled();
  });
});
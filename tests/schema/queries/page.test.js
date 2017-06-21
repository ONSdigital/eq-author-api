const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Page query" , () => {

  const page = `
    query GetPage($id: Int!) {
      page(id: $id) {
        id,
        title,
        description,
        QuestionnaireId
      }
    }
  `;

  const pageWithQuestions = `
    query GetPageWithQuestions($id: Int!) {
      page(id: $id) {
        id,
        questions {
          id
        }
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      Page : mockRepository(),
      Question : mockRepository()
    }
  });

  it("should fetch page by id", async () => {
    const result = await executeQuery(page, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.get).toHaveBeenCalledWith(id);
    expect(repositories.Question.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with questions", async () => {
    repositories.Page.get.mockImplementation(() => ({ id }));

    const result = await executeQuery(pageWithQuestions, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Page.get).toHaveBeenCalledWith(id);
    expect(repositories.Question.findAll).toHaveBeenCalledWith({ PageId : id });
  });
});
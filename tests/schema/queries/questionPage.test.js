const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("QuestionPage query", () => {
  const questionPage = `
    query GetQuestionPage($id: Int!) {
      questionPage(id: $id) {
        id,
        title,
        description,
        guidance,
        type,
        mandatory,
        sectionId
      }
    }
  `;

  const questionPageWithAnswers = `
    query GetQuestionPageWithAnswers($id: Int!) {
      questionPage(id: $id) {
        id,
        answers {
          id
        }
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      QuestionPage: mockRepository(),
      Answer: mockRepository()
    };
  });

  it("should fetch QuestionPage by id", async () => {
    const result = await executeQuery(questionPage, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.get).toHaveBeenCalledWith(id);
    expect(repositories.Answer.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Answer", async () => {
    repositories.QuestionPage.get.mockImplementation(() => ({ id }));

    const result = await executeQuery(
      questionPageWithAnswers,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.QuestionPage.get).toHaveBeenCalledWith(id);
    expect(repositories.Answer.findAll).toHaveBeenCalledWith({
      QuestionPageId: id
    });
  });
});

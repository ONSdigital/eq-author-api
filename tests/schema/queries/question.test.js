const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Question query" , () => {

  const question = `
    query GetQuestion($id: Int!) {
      question(id: $id) {
        id,
        title,
        description,
        guidance,
        type,
        mandatory,
        GroupId
      }
    }
  `;

  const questionWithAnswers = `
    query GetQuestionWithAnswers($id: Int!) {
      question(id: $id) {
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
      Question : mockRepository(),
      Answer : mockRepository(),
    }
  });

  it("should fetch question by id", async () => {
    const result = await executeQuery(question, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Question.get).toHaveBeenCalledWith(id);
    expect(repositories.Answer.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with questions", async () => {
    repositories.Question.get.mockImplementation(() => ({ id }));

    const result = await executeQuery(questionWithAnswers, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Question.get).toHaveBeenCalledWith(id);
    expect(repositories.Answer.findAll).toHaveBeenCalledWith({ QuestionId : id });
  });
});
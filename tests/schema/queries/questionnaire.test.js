const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("questionnaire query", () => {
  const questionnaire = `
    query GetQuestionnaire($id : Int!) {
      questionnaire(id: $id) {
        id
      }
    }
  `;

  const questionnaireWithSections = `
    query GetQuestionnaireWithSections($id : Int!) {
      questionnaire(id: $id) {
        id,
        sections {
          id
        }
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      Questionnaire: mockRepository({
        get: { id }
      }),
      Section: mockRepository()
    };
  });

  it("should fetch questionnaire by id", async () => {
    const result = await executeQuery(questionnaire, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.get).toHaveBeenCalledWith(id);
    expect(repositories.Section.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Sections", async () => {
    const result = await executeQuery(
      questionnaireWithSections,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.get).toHaveBeenCalledWith(id);
    expect(repositories.Section.findAll).toHaveBeenCalledWith({
      QuestionnaireId: id
    });
  });
});

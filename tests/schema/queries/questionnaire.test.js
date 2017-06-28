const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("questionnaire query" , () => {

  const questionnaire = `
    query GetQuestionnaire($id : Int!) {
      questionnaire(id: $id) {
        id,
        title,
        description,
        navigation,
        legalBasis,
        theme
      }
    }
  `;

  const questionnaireWithPages = `
    query GetQuestionnaireWithPages($id : Int!) {
      questionnaire(id: $id) {
        id,
        groups {
          id
        }
      }
    }
  `;

  const id = 1;
  let repositories;

  beforeEach(() => {
    repositories = {
      Questionnaire : mockRepository(),
      Group : mockRepository()
    }
  });

  it("should fetch questionnaire by id", async () => {
    const result = await executeQuery(questionnaire, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.get).toHaveBeenCalledWith(id);
    expect(repositories.Group.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Groups", async () => {
    repositories.Questionnaire.get.mockImplementation(() => ({ id }));

    const result = await executeQuery(questionnaireWithPages, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.get).toHaveBeenCalledWith(id);
    expect(repositories.Group.findAll).toHaveBeenCalledWith({ QuestionnaireId : id });
  });
});
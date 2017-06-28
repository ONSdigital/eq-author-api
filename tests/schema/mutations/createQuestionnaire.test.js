const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createQuestionnaire" , () => {

  const createQuestionnaire = `
    mutation CreateQuestionnaire(
      $title: String!,
      $description: String!,
      $theme: String!,
      $legalBasis: LegalBasis!,
      $navigation: Boolean,
      $surveyId : String!
    ) {
      createQuestionnaire(
        title: $title,
        description: $description,
        theme: $theme,
        legalBasis: $legalBasis,
        navigation: $navigation,
        surveyId : $surveyId
      ) {
        id,
        title,
        description,
        navigation,
        legalBasis,
        theme
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Questionnaire : mockRepository("question")
    };
  });

  it("should allow creation of Questionnaire", async () => {
    const fixture = {
      "title": "Test questionnaire",
      "description": "This is a test questionnaire",
      "theme": "test theme",
      "legalBasis": "Voluntary",
      "navigation": true,
      "surveyId": "abc"
    };

    const result = await executeQuery(createQuestionnaire, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.insert).toHaveBeenCalled();
  });
});
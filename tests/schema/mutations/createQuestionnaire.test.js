const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createQuestionnaire", () => {
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

  const QUESTIONNAIRE_ID = 123;
  const SECTION_ID = 456;

  beforeEach(() => {
    repositories = {
      Questionnaire: mockRepository({
        insert: { id: QUESTIONNAIRE_ID }
      }),
      Section: mockRepository({
        insert: { id: SECTION_ID }
      }),
      Page: mockRepository()
    };
  });

  it("should allow creation of Questionnaire", async () => {
    const fixture = {
      title: "Test questionnaire",
      description: "This is a test questionnaire",
      theme: "test theme",
      legalBasis: "Voluntary",
      navigation: true,
      surveyId: "abc"
    };

    const result = await executeQuery(createQuestionnaire, fixture, {
      repositories
    });

    expect(result.errors).toBeUndefined();
    expect(result.data.createQuestionnaire.id).toBe(QUESTIONNAIRE_ID);

    expect(repositories.Questionnaire.insert).toHaveBeenCalled();
    expect(repositories.Section.insert).toHaveBeenCalledWith(
      expect.objectContaining({ questionnaireId: QUESTIONNAIRE_ID })
    );
    expect(repositories.Page.insert).toHaveBeenCalledWith(
      expect.objectContaining({ sectionId: SECTION_ID })
    );
  });
});

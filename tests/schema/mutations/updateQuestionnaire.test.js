const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("updateQuestionnaire" , () => {

  const updateQuestionnaire = `
    mutation UpdateQuestionnaire(
      $id:Int!,
      $title: String!,
      $description: String!,
      $theme: String!,
      $legalBasis: String!,
      $navigation: Boolean
    ) {
      updateQuestionnaire(
        id:$id,
        title: $title,
        description: $description,
        theme: $theme,
        legalBasis: $legalBasis,
        navigation: $navigation
      ) {
        id
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Questionnaire : mockRepository()
    }
  });

  it("should allow update of Questionnaire", async () => {
    const fixture = {
      id: 1,
      title: "Test questionnaire",
      description: "This is a test questionnaire",
      theme: "test theme",
      legalBasis: "Voluntary",
      navigation: false
    };

    const result = await executeQuery(updateQuestionnaire, fixture, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Questionnaire.update).toHaveBeenCalled();
  });
});
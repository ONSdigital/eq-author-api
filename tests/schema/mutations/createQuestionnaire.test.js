const { Questionnaire } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("createQuestionnaire" , () => {

  const createQuestionnaire = `
    mutation CreateQuestionnaire(
      $title: String!,
      $description: String!,
      $theme: String!,
      $legalBasis: String!,
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

  it("should allow creation of Questionnaire", async () => {
    const fixture = {
      "title": "Test questionnaire",
      "description": "This is a test questionnaire",
      "theme": "test theme",
      "legalBasis": "Voluntary",
      "navigation": true,
      "surveyId": "abc"
    };

    const result = await executeQuery(createQuestionnaire, fixture);
    const expected = await Questionnaire.findById(result.createQuestionnaire.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.createQuestionnaire));
  });
});
const { Questionnaire } = require("../../../models");
const executeQuery = require("../../utils/executeQuery");

describe("updateQuestionnaire" , () => {

  const updateQuestionnaire = `
    mutation UpdateQuestionnaire(
      $id:ID!,
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

  it("should allow update of Questionnaire", async () => {
    const fixture = {
      id: 1,
      title: "Test questionnaire",
      description: "This is a test questionnaire",
      theme: "test theme",
      legalBasis: "Voluntary",
      navigation: false
    };

    const result = await executeQuery(updateQuestionnaire, fixture);
    const expected = await Questionnaire.findById(result.updateQuestionnaire.id);

    expect(expected.get({ plain : true })).toEqual(expect.objectContaining(result.updateQuestionnaire));
  });
});
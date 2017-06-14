const findFixture = require("../../utils/findFixture");
const executeQuery = require("../../utils/executeQuery");

describe("questionnaire query" , () => {

  const questionnaire = `
    query GetQuestionnaire($id : ID!) {
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
    query GetQuestionnaireWithPages($id : ID!) {
      questionnaire(id: $id) {
        id,
        pages {
          id
        }
      }
    }
  `;

  it("should fetch questionnaire by id", async () => {
    const result = await executeQuery(questionnaire, { id : 1 });
    const expected = expect.objectContaining(findFixture("Questionnaire", 1));

    expect(result.questionnaire).toEqual(expected);
  });

  it("should return null if no matching questionnaire", async () => {
    const result = await executeQuery(questionnaire, { id : -10 });
    const expected = null;

    expect(result.questionnaire).toEqual(expected);
  });

  it("should have an association with pages", async () => {
    const result = await executeQuery(questionnaireWithPages, { id : 1 });
    const expected = expect.objectContaining({
      id : 1,
      pages : [{ id : 1 }]
    });

    expect(result.questionnaire).toEqual(expected);
  });
});
const findFixture = require("../../utils/findFixture");
const executeQuery = require("../../utils/executeQuery");

describe("Page query" , () => {

  const page = id => `
    query GetPage {
      page(id: ${id}) {
        id,
        title,
        description,
        QuestionnaireId
      }
    }
  `;

  const pageWithQuestions = id => `
    query GetPageWithQuestions {
      page(id: ${id}) {
        id,
        questions {
          id
        }
      }
    }
  `;

  it("should fetch page by id", async () => {
    const result = await executeQuery(page(1));
    const expected = expect.objectContaining(findFixture("Page", 1));

    expect(result.page).toEqual(expected);
  });

  it("should return null if no matching page", async () => {
    const result = await executeQuery(page(-10));
    const expected = null;

    expect(result.page).toEqual(expected);
  });

  it("should have an association with questions", async () => {
    const result = await executeQuery(pageWithQuestions(1));
    const expected = expect.objectContaining({
      id : 1,
      questions : [{ id : 1 }]
    });

    expect(result.page).toEqual(expected);
  });
});
const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("Section query", () => {
  const section = `
    query GetSection($id: ID!) {
      section(id: $id) {
        id,
        description
      }
    }
  `;

  const sectionWithPages = `
    query GetSection($id: ID!) {
      section(id: $id) {
        id,
        pages {
          id
        }
      }
    }
  `;

  const sectionWithQuestionnaire = `
    query GetSection($id: ID!) {
      section(id: $id) {
        id,
        questionnaire {
          id
        }
      }
    }
  `;

  const id = "1";
  const questionnaireId = "2";

  let repositories;

  beforeEach(() => {
    repositories = {
      Section: mockRepository({
        get: {
          id,
          questionnaireId
        }
      }),
      Page: mockRepository(),
      Questionnaire: mockRepository()
    };
  });

  it("should fetch page by id", async () => {
    const result = await executeQuery(section, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).not.toHaveBeenCalled();
  });

  it("should have an association with Pages", async () => {
    const result = await executeQuery(
      sectionWithPages,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.get).toHaveBeenCalledWith(id);
    expect(repositories.Page.findAll).toHaveBeenCalledWith({ SectionId: id });
  });

  it("should have an association with Questionnaire", async () => {
    const result = await executeQuery(
      sectionWithQuestionnaire,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.get).toHaveBeenCalledWith(id);
    expect(repositories.Questionnaire.get).toHaveBeenCalledWith(
      questionnaireId
    );
  });
});

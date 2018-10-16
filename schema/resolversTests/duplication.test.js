const executeQuery = require("../../tests/utils/executeQuery");

describe("Duplication", () => {
  beforeEach(async () => {});

  it("should be able to duplicate a page", async () => {
    const ctx = {
      repositories: {
        Page: {
          duplicatePage: jest.fn(() => ({
            id: 2,
            title: "Duplicate page",
            pageType: "QuestionPage"
          }))
        }
      }
    };
    const query = `
    mutation duplicatePage($input: DuplicatePageInput!) {
        duplicatePage(input: $input) {
            id
      }
    }
    `;
    const result = await executeQuery(
      query,
      { input: { id: "1", position: 1 } },
      ctx
    );
    expect(result.errors).toBeUndefined();
    expect(ctx.repositories.Page.duplicatePage).toHaveBeenCalledWith("1", 1);
    expect(result.data).toMatchObject({
      duplicatePage: { id: "2" }
    });
  });

  it("should be able to duplicate a section", async () => {
    const ctx = {
      repositories: {
        Section: {
          duplicateSection: jest.fn(() => ({
            id: 2,
            title: "Duplicate Section"
          }))
        }
      }
    };
    const query = `
    mutation duplicateSection($input: DuplicateSectionInput!) {
        duplicateSection(input: $input) {
            id
        }
    }
    `;
    const result = await executeQuery(
      query,
      { input: { id: "1", position: 1 } },
      ctx
    );
    expect(result.errors).toBeUndefined();
    expect(ctx.repositories.Section.duplicateSection).toHaveBeenCalledWith(
      "1",
      1
    );
    expect(result.data).toMatchObject({
      duplicateSection: { id: "2" }
    });
  });
});
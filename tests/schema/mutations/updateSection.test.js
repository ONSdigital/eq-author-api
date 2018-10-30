const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");
const {
  createSectionIntroMutation,
  updateSectionIntroMutation,
  deleteSectionIntroMutation,
  undeleteSectionIntroMutation
} = require("../../utils/graphql");

describe("updateSection", () => {
  const updateSection = `
    mutation UpdateSection($input: UpdateSectionInput!) {
      updateSection(input: $input) {
        id
        title
        alias
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Section: mockRepository()
    };
  });

  it("should allow update of Section", async () => {
    const input = {
      id: "1",
      title: "Updated section title",
      alias: "Updated section alias",
      description: "This is an updated section description"
    };

    const result = await executeQuery(
      updateSection,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith(input);
  });

  it("should allow creation of section introductions", async () => {
    repositories = {
      Section: { update: jest.fn(() => ({ content: null, title: null })) }
    };

    const input = {
      sectionId: "1"
    };

    const result = await executeQuery(
      createSectionIntroMutation,
      { input },
      { repositories }
    );
    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith({
      id: input.sectionId,
      introductionContent: null,
      introductionEnabled: true,
      introductionTitle: null
    });
  });

  it("should allow update of section introductions", async () => {
    repositories = {
      Section: { update: jest.fn(() => ({ content: "bar", title: "foo" })) }
    };

    const input = {
      sectionId: "1",
      title: "foo",
      content: "bar"
    };

    const result = await executeQuery(
      updateSectionIntroMutation,
      { input },
      { repositories }
    );
    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith({
      id: input.sectionId,
      introductionContent: "bar",
      introductionTitle: "foo"
    });
  });

  it("should allow deletion of section introductions", async () => {
    repositories = {
      Section: { update: jest.fn(() => ({ content: "bar", title: "foo" })) }
    };

    const input = {
      sectionId: "1"
    };

    const result = await executeQuery(
      deleteSectionIntroMutation,
      { input },
      { repositories }
    );
    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith({
      id: input.sectionId,
      introductionEnabled: false
    });
  });

  it("should allow un-deletion of section introductions", async () => {
    repositories = {
      Section: { update: jest.fn(() => ({ content: "bar", title: "foo" })) }
    };

    const input = {
      sectionId: "1"
    };

    const result = await executeQuery(
      undeleteSectionIntroMutation,
      { input },
      { repositories }
    );
    expect(result.errors).toBeUndefined();
    expect(repositories.Section.update).toHaveBeenCalledWith({
      id: input.sectionId,
      introductionEnabled: true
    });
  });
});

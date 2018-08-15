const updateTitle = require("./updateTitle");

describe("Update Title", () => {
  it("should prepend 'Copy of' to a title without markup tags when no prefix is supplied", () => {
    const title = "Hello";

    const updatedTitle = updateTitle(title);

    expect(updatedTitle).toBe(`Copy of ${title}`);
  });

  it("should prepend 'Copy of' to a title with markup tags when no prefix is supplied", () => {
    const title = "<p>Hello</p>";

    const updatedTitle = updateTitle(title);

    const startsWithCopyOf = updatedTitle.startsWith("Copy of ", 3);

    expect(startsWithCopyOf).toBe(true);
  });

  it("should not prepend 'Copy of' to a title without markup tags when a prefix is supplied", () => {
    const title = "Hello";

    const updatedTitle = updateTitle(title, "Oh,");

    expect(updatedTitle).not.toBe(`Copy of ${title}`);
  });

  it("should not prepend 'Copy of' to a title with markup tags when a prefix is supplied", () => {
    const title = "<p>Hello</p>";

    const updatedTitle = updateTitle(title, "Oh,");

    const startsWithCopyOf = updatedTitle.startsWith("Copy of ", 3);

    expect(startsWithCopyOf).toBe(false);
  });

  it("should prepend a title without markup tags with a given prefix", () => {
    const title = "Hello";

    const updatedTitle = updateTitle(title, "Oh, ");

    expect(updatedTitle).toBe(`Oh, ${title}`);
  });

  it("should prepend a title with markup tags with a given prefix", () => {
    const title = "<p>Hello</p>";

    const updatedTitle = updateTitle(title, "Oh, ");

    const startsWithCopyOf = updatedTitle.startsWith("Oh, ", 3);

    expect(startsWithCopyOf).toBe(true);
  });

  it("should not prepend an empty title", () => {
    expect(updateTitle("")).toEqual("");
  });

  it("should not prepend an empty title surrounded by tags", () => {
    expect(updateTitle("<p></p>")).toEqual("<p></p>");
  });
});

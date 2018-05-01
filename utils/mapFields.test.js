const mapFields = require("./mapFields");

describe("mapField", () => {
  it("should map field", () => {
    const expected = {
      b: true,
      c: false
    };

    expect(mapFields({ a: "b" }, { a: true, c: false })).toEqual(expected);
  });

  it("should return null if obj is null", () => {
    expect(mapFields({ a: "b" }, null)).toBeNull();
  });
});

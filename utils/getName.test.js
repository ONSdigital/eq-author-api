const { keys, map } = require("lodash");
const { getName, defaultNames } = require("./getName");

describe("getName", () => {
  let entity;

  it("should correctly use default names", () => {
    entity = {
      alias: "",
      title: "",
      label: ""
    };

    map(keys(defaultNames), typeName =>
      expect(getName(entity, typeName)).toEqual(defaultNames[typeName])
    );
  });

  it("should use correct key", () => {
    entity = {
      alias: "",
      title: "I am a title",
      label: "I am a label"
    };

    map(keys(defaultNames), typeName =>
      expect(getName(entity, typeName)).toEqual(entity.title)
    );

    entity = {
      alias: "",
      title: "",
      label: "I am a label"
    };

    map(keys(defaultNames), typeName =>
      expect(getName(entity, typeName)).toEqual(entity.label)
    );
  });

  it("should ignore any html markup", () => {
    entity = {
      alias: "<p></p>",
      title: "<p>I am a title</p>",
      label: "<p>I am a label</p>"
    };

    map(keys(defaultNames), typeName =>
      expect(getName(entity, typeName)).toEqual("I am a title")
    );
  });

  it("should ignore invalid keys", () => {
    entity = {
      alias: "<p></p>",
      foo: "I am a title",
      label: "I am a label"
    };

    map(keys(defaultNames), typeName =>
      expect(getName(entity, typeName)).toEqual(entity.label)
    );
  });
});

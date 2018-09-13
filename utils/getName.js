const { find, pick, isEmpty } = require("lodash");
const { stripTags } = require("./html");

const defaultNames = {
  Section: "Untitled Section",
  QuestionPage: "Untitled Page",
  Option: "Untitled Label",
  BasicAnswer: "Untitled Answer",
  MultipleChoiceAnswer: "Untitled Answer",
  CompositeAnswer: "Untitled Answer"
};

const getName = (entity, typeName) => {
  const title = find(
    pick(entity, ["alias", "title", "label"]),
    value => !isEmpty(stripTags(value))
  );

  return title ? stripTags(title) : defaultNames[typeName];
};

module.exports = {
  getName,
  defaultNames
};

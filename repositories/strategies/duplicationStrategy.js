const { head } = require("lodash/fp");
const mapFields = require("../../utils/mapFields");
const mapping = { SectionId: "sectionId", AnswerId: "answerId" };
const fromDb = mapFields(mapping);

const columnsToDuplicate = {
  Pages: ["title", "description", "pageType", "guidance", "order", "SectionId"],
  Answers: [
    "description",
    "guidance",
    "qCode",
    "label",
    "type",
    "QuestionPageId",
    "secondaryLabel",
    "properties"
  ],
  Options: ["label", "description", "value", "qCode"]
};

const duplicateStrategy = async (
  trx,
  tableName,
  where,
  callbackFn,
  overrides = {}
) => {
  const thingToDuplicate = await trx(tableName)
    .select(columnsToDuplicate[tableName])
    .where(where)
    .first();

  if (!thingToDuplicate) {
    throw new Error(
      `Cannot duplicate from ${tableName} where ${JSON.stringify(where)}`
    );
  }

  const cloned = await trx(tableName)
    .insert({
      ...thingToDuplicate,
      ...overrides
    })
    .returning("*")
    .then(head)
    .then(fromDb);

  if (callbackFn) {
    await callbackFn(
      trx,
      {
        ...thingToDuplicate,
        ...where
      },
      cloned
    );
  }

  return cloned;
};

module.exports = {
  duplicateStrategy
};

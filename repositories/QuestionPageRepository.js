const { head, invert, map, noop } = require("lodash/fp");
const QuestionPage = require("../db/QuestionPage");
const mapFields = require("../utils/mapFields");
const knex = require("../db");

const mapping = { SectionId: "sectionId", AnswerId: "answerId" };
const fromDb = mapFields(mapping);
const toDb = mapFields(invert(mapping));

module.exports.findAll = function findAll(
  where = {},
  orderBy = "created_at",
  direction = "asc"
) {
  return QuestionPage.findAll()
    .where({ isDeleted: false })
    .where(where)
    .orderBy(orderBy, direction)
    .then(map(fromDb));
};

module.exports.getById = function getById(id) {
  return QuestionPage.findById(id)
    .where({ isDeleted: false })
    .then(fromDb);
};

module.exports.insert = function insert(
  { title, description, guidance, sectionId, order },
  db = knex
) {
  return QuestionPage.create(
    toDb({
      title,
      description,
      guidance,
      sectionId,
      order
    }),
    db
  )
    .then(head)
    .then(fromDb);
};

module.exports.update = function update({
  id,
  title,
  description,
  guidance,
  isDeleted
}) {
  return QuestionPage.update(id, {
    title,
    description,
    guidance,
    isDeleted
  })
    .then(head)
    .then(fromDb);
};

module.exports.remove = function remove(id) {
  return QuestionPage.update(id, { isDeleted: true })
    .then(head)
    .then(fromDb);
};

module.exports.undelete = function(id) {
  return QuestionPage.update(id, { isDeleted: false })
    .then(head)
    .then(fromDb);
};

const duplicateStrategy = async (
  trx,
  tableName,
  columns,
  where,
  mapFn,
  callbackFn,
  overrides = {}
) => {
  const thingToDuplicate = await trx(tableName)
    .select(columns)
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
    .then(mapFn);

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

const isMultipleChoiceAnswer = ({ type }) =>
  type === "Checkbox" || type === "Radio";

const duplicateOptions = async (trx, originalAnswer, clonedAnswer) => {
  // TODO need to deal with "other" option
  // TODO need to ignore deleted options
  const optionsToDuplicate = await trx("Options")
    .where({ AnswerId: originalAnswer.id, isDeleted: false })
    .select("id");
  const columns = ["label", "description", "value", "qCode"];

  return Promise.all(
    map(option =>
      duplicateStrategy(trx, "Options", columns, option, fromDb, noop, {
        AnswerId: clonedAnswer.id
      })
    )(optionsToDuplicate)
  );
};

const answerCloned = async (trx, original, clonedAnswer) => {
  if (isMultipleChoiceAnswer(original)) {
    await duplicateOptions(trx, original, clonedAnswer);
  }
};

const duplicateAnswers = async (trx, originalPage, clonedPage) => {
  // TODO pin this down to only answers for the page
  // TODO pin this down to only non-deleted answers
  const answersToDuplicate = await trx("Answers").select("id");
  const columns = [
    "description",
    "guidance",
    "qCode",
    "label",
    "type",
    "QuestionPageId",
    "secondaryLabel",
    "properties"
  ];

  return Promise.all(
    map(answer =>
      duplicateStrategy(trx, "Answers", columns, answer, fromDb, answerCloned, {
        QuestionPageId: clonedPage.id
      })
    )(answersToDuplicate)
  );
};

const questionPageCloned = async (trx, originalPage, clonedPage) => {
  await duplicateAnswers(trx, originalPage, clonedPage);
};

const duplicateQuestionPage = (input, db = knex) => {
  const columns = [
    "title",
    "description",
    "pageType",
    "guidance",
    "order",
    "SectionId"
  ];

  return db.transaction(trx =>
    duplicateStrategy(trx, "Pages", columns, input, fromDb, questionPageCloned)
  );
};

module.exports.duplicateQuestionPage = duplicateQuestionPage;

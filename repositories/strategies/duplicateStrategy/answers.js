const { head, omit } = require("lodash");
const { duplicateRecord, selectData, insertData } = require("./utils");

const duplicateOptionStrategy = async (
  trx,
  option,
  overrides = {},
  references
) => {
  const duplicatedOption = await duplicateRecord(
    trx,
    "Options",
    option,
    overrides
  );

  references.options[option.id] = duplicatedOption.id;

  return selectData(trx, "Options", "*", { id: duplicatedOption.id }).then(
    head
  );
};

const duplicateValidationStrategy = async (trx, validation, overrides = {}) => {
  const duplicatedValidation = await duplicateRecord(
    trx,
    "Validation_AnswerRules",
    validation,
    overrides
  );

  return selectData(trx, "Validation_AnswerRules", "*", {
    id: duplicatedValidation.id
  }).then(head);
};

const duplicateOtherAnswer = async (
  trx,
  otherAnswer,
  duplicateAnswer,
  references
) => {
  const duplicateOtherAnswer = omit(otherAnswer, "id");
  duplicateOtherAnswer.parentAnswerId = duplicateAnswer.id;

  const duplicateOtherAnswerId = await insertData(
    trx,
    "Answers",
    duplicateOtherAnswer,
    head,
    "id"
  );

  const otherOptionToDuplicate = await selectData(trx, "Options", "*", {
    otherAnswerId: otherAnswer.id
  }).then(head);

  await duplicateOptionStrategy(
    trx,
    otherOptionToDuplicate,
    {
      parentRelation: { id: duplicateAnswer.id, columnName: "answerId" },
      otherAnswerId: duplicateOtherAnswerId
    },
    references
  );
};

const duplicateAnswerStrategy = async (
  trx,
  answer,
  overrides = {},
  references
) => {
  const duplicateAnswer = await duplicateRecord(
    trx,
    "Answers",
    answer,
    overrides
  );
  references.answers[answer.id] = duplicateAnswer.id;

  const otherAnswer = await selectData(trx, "Answers", "*", {
    parentAnswerId: answer.id
  }).then(head);

  if (otherAnswer) {
    await duplicateOtherAnswer(trx, otherAnswer, duplicateAnswer, references);
  }

  const optionsToDuplicate = await selectData(
    trx,
    "Options",
    "*",
    {
      answerId: answer.id,
      otherAnswerId: null,
      isDeleted: false
    },
    {
      column: "id",
      direction: "asc"
    }
  );

  // Need to preserve id order so insert them in the order we got them
  const promiseInsertionQueue = optionsToDuplicate.reduce(
    (queue, option) =>
      queue.then(() =>
        duplicateOptionStrategy(
          trx,
          option,
          {
            parentRelation: {
              id: duplicateAnswer.id,
              columnName: "answerId"
            }
          },
          references
        )
      ),
    Promise.resolve()
  );

  await promiseInsertionQueue;

  const validationsToDuplicate = await selectData(
    trx,
    "Validation_AnswerRules",
    "*",
    {
      answerId: answer.id
    }
  );
  await Promise.all(
    validationsToDuplicate.map(validation =>
      duplicateValidationStrategy(trx, validation, {
        parentRelation: { id: duplicateAnswer.id, columnName: "answerId" }
      })
    )
  );

  return selectData(trx, "Answers", "*", { id: duplicateAnswer.id }).then(head);
};

module.exports = duplicateAnswerStrategy;

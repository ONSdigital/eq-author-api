const { omit, head, get, isNil } = require("lodash");
const {
  getOrUpdateOrderForPageInsert,
  getOrUpdateOrderForSectionInsert
} = require("./spacedOrderStrategy");

const insertData = async (
  trx,
  tableName,
  data,
  callback,
  returning = "*",
  position
) => {
  const returnedData = await trx
    .table(tableName)
    .insert(data)
    .returning(returning)
    .then(callback);

  if (returnedData.order) {
    let updateOrder = getOrUpdateOrderForPageInsert;
    let parentId = returnedData.sectionId;
    if (tableName === "Sections") {
      updateOrder = getOrUpdateOrderForSectionInsert;
      parentId = returnedData.questionnaireId;
    }
    const order = await updateOrder(trx, parentId, returnedData.id, position);

    await trx
      .table(tableName)
      .update({ order })
      .where({ id: returnedData.id });
  }

  return returnedData;
};

const selectData = (trx, tableName, columns, where, orderBy) => {
  const queryP = trx
    .select(columns)
    .from(tableName)
    .where(where);
  if (orderBy) {
    const { column, direction } = orderBy;
    queryP.orderBy(column, direction);
  }
  return queryP;
};

const duplicateRecord = async (
  trx,
  tableName,
  record,
  overrides = {},
  position
) => {
  const duplicatedRecord = omit(record, "id", "createdAt", "updatedAt");
  const { parentRelation, ...other } = overrides;

  if (!isNil(parentRelation)) {
    duplicatedRecord[get(parentRelation, "columnName")] = get(
      parentRelation,
      "id"
    );
  }

  const newRecord = { ...duplicatedRecord, ...other };

  return insertData(trx, tableName, newRecord, head, "*", position);
};

const duplicateOptionStrategy = async (trx, option, overrides = {}) => {
  const duplicatedOption = await duplicateRecord(
    trx,
    "Options",
    option,
    overrides
  );

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

const duplicateOtherAnswer = async (trx, otherAnswer, duplicateAnswer) => {
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

  await duplicateOptionStrategy(trx, otherOptionToDuplicate, {
    parentRelation: { id: duplicateAnswer.id, columnName: "answerId" },
    otherAnswerId: duplicateOtherAnswerId
  });
};

const duplicateAnswerStrategy = async (trx, answer, overrides = {}) => {
  const duplicateAnswer = await duplicateRecord(
    trx,
    "Answers",
    answer,
    overrides
  );
  const otherAnswer = await selectData(trx, "Answers", "*", {
    parentAnswerId: answer.id
  }).then(head);

  if (otherAnswer) {
    await duplicateOtherAnswer(trx, otherAnswer, duplicateAnswer);
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
        duplicateOptionStrategy(trx, option, {
          parentRelation: { id: duplicateAnswer.id, columnName: "answerId" }
        })
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

const duplicatePageStrategy = async (trx, page, position, overrides = {}) => {
  const duplicatePage = await duplicateRecord(
    trx,
    "Pages",
    page,
    overrides,
    position
  );

  const answersToDuplicate = await selectData(trx, "Answers", "*", {
    questionPageId: page.id,
    isDeleted: false
  });

  await Promise.all(
    answersToDuplicate.map(answer =>
      duplicateAnswerStrategy(trx, answer, {
        parentRelation: {
          id: duplicatePage.id,
          columnName: "questionPageId"
        }
      })
    )
  );

  return selectData(trx, "Pages", "*", { id: duplicatePage.id }).then(head);
};

const duplicateSectionStrategy = async (
  trx,
  section,
  position,
  overrides = {}
) => {
  const duplicateSection = await duplicateRecord(
    trx,
    "Sections",
    section,
    overrides,
    position
  );

  const pagesToDuplicate = await selectData(trx, "PagesView", "*", {
    sectionId: section.id
  });

  await Promise.all(
    pagesToDuplicate.map(({ position, ...page }) =>
      duplicatePageStrategy(trx, page, position, {
        parentRelation: {
          id: duplicateSection.id,
          columnName: "sectionId"
        }
      })
    )
  );

  return duplicateSection;
};

const duplicateMetadata = async (trx, metadata, overrides) =>
  duplicateRecord(trx, "Metadata", metadata, overrides);

const duplicateQuestionnaireStrategy = async (
  trx,
  questionnaire,
  overrides = {}
) => {
  const duplicateQuestionnaire = await duplicateRecord(
    trx,
    "Questionnaires",
    questionnaire,
    overrides
  );
  const sectionsToDuplicate = await selectData(trx, "SectionsView", "*", {
    questionnaireId: questionnaire.id
  });

  await Promise.all(
    sectionsToDuplicate.map(({ position, ...section }) =>
      duplicateSectionStrategy(trx, section, position, {
        parentRelation: {
          id: duplicateQuestionnaire.id,
          columnName: "questionnaireId"
        }
      })
    )
  );

  const metadataToDuplicate = await selectData(trx, "Metadata", "*", {
    questionnaireId: questionnaire.id
  });

  await Promise.all(
    metadataToDuplicate.map(metadata =>
      duplicateMetadata(trx, metadata, {
        parentRelation: {
          id: duplicateQuestionnaire.id,
          columnName: "questionnaireId"
        }
      })
    )
  );

  return duplicateQuestionnaire;
};

Object.assign(module.exports, {
  insertData,
  selectData,
  duplicateRecord,
  duplicateOptionStrategy,
  duplicateAnswerStrategy,
  duplicatePageStrategy,
  duplicateSectionStrategy,
  duplicateQuestionnaireStrategy
});

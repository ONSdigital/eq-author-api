const { omit, head, get, isNil } = require("lodash");
const cheerio = require("cheerio");
const {
  getOrUpdateOrderForPageInsert,
  getOrUpdateOrderForSectionInsert
} = require("./spacedOrderStrategy");

const updatePiping = (field, references) => {
  if (!field || field.indexOf("<span") === -1) {
    return field;
  }

  const $ = cheerio.load(field);

  $("span").map((i, el) => {
    const $el = $(el);
    const pipeType = $el.data("piped");
    const id = $el.data("id");

    const newId = references[pipeType][id];

    // Can't use data as it doesn't work
    // https://github.com/cheeriojs/cheerio/issues/1240
    $el.attr("data-id", newId);

    return $.html($el);
  });

  return $("body").html();
};

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

const duplicatePageStrategy = async (
  trx,
  page,
  position,
  overrides = {},
  references = { answers: {}, metadata: {} }
) => {
  const duplicatePage = await duplicateRecord(
    trx,
    "Pages",
    page,
    {
      ...overrides,
      title: updatePiping(overrides.title || page.title, references),
      description: updatePiping(
        overrides.description || page.description,
        references
      ),
      guidance: updatePiping(overrides.guidance || page.guidance, references)
    },
    position
  );

  const answersToDuplicate = await selectData(trx, "Answers", "*", {
    questionPageId: page.id,
    isDeleted: false
  });

  await Promise.all(
    answersToDuplicate.map(answer =>
      duplicateAnswerStrategy(
        trx,
        answer,
        {
          parentRelation: {
            id: duplicatePage.id,
            columnName: "questionPageId"
          }
        },
        references
      )
    )
  );

  return selectData(trx, "Pages", "*", { id: duplicatePage.id }).then(head);
};

const duplicateSectionStrategy = async (
  trx,
  section,
  position,
  overrides = {},
  references = { answers: {}, metadata: {} }
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

  for (let i = 0; i < pagesToDuplicate.length; ++i) {
    const { position, ...page } = pagesToDuplicate[i];
    await duplicatePageStrategy(
      trx,
      page,
      position,
      {
        parentRelation: {
          id: duplicateSection.id,
          columnName: "sectionId"
        }
      },
      references
    );
  }

  return duplicateSection;
};

const duplicateMetadata = async (trx, metadata, overrides, references) => {
  const duplicatedMetadata = await duplicateRecord(
    trx,
    "Metadata",
    metadata,
    overrides
  );

  references.metadata[metadata.id] = duplicatedMetadata.id;

  return duplicatedMetadata;
};

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

  const references = {
    metadata: {},
    answers: {}
  };

  const metadataToDuplicate = await selectData(trx, "Metadata", "*", {
    questionnaireId: questionnaire.id
  });

  await Promise.all(
    metadataToDuplicate.map(metadata =>
      duplicateMetadata(
        trx,
        metadata,
        {
          parentRelation: {
            id: duplicateQuestionnaire.id,
            columnName: "questionnaireId"
          }
        },
        references
      )
    )
  );

  const sectionsToDuplicate = await selectData(trx, "SectionsView", "*", {
    questionnaireId: questionnaire.id
  });

  // Need to execute these in order so we can update piping references
  for (let i = 0; i < sectionsToDuplicate.length; ++i) {
    const { position, ...section } = sectionsToDuplicate[i];
    await duplicateSectionStrategy(
      trx,
      section,
      position,
      {
        parentRelation: {
          id: duplicateQuestionnaire.id,
          columnName: "questionnaireId"
        }
      },
      references
    );
  }

  return duplicateQuestionnaire;
};

Object.assign(module.exports, {
  duplicatePageStrategy,
  duplicateSectionStrategy,
  duplicateQuestionnaireStrategy
});

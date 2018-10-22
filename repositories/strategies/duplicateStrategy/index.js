const { head } = require("lodash");

const { selectData, duplicateRecord } = require("./utils");
const updatePiping = require("./piping");
const duplicateRouting = require("./routing");
const duplicateAnswerStrategy = require("./answers");

const getDefaultReferenceStructure = () => ({
  options: {},
  answers: {},
  pages: {},
  sections: {},
  metadata: {},
  pagesWithRouting: []
});

const duplicatePageStrategy = async (
  trx,
  page,
  position,
  overrides = {},
  references = getDefaultReferenceStructure(),
  shouldDuplicateRouting = true
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

  references.pages[page.id] = duplicatePage.id;

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

  const ruleSet = await selectData(trx, "Routing_RuleSets", "*", {
    questionPageId: page.id,
    isDeleted: false
  }).then(head);

  if (ruleSet) {
    references.pagesWithRouting.push({
      page,
      duplicatePage,
      ruleSet
    });
  }

  if (shouldDuplicateRouting) {
    await duplicateRouting(trx, references.pagesWithRouting, references);
  }

  return selectData(trx, "Pages", "*", { id: duplicatePage.id }).then(head);
};

const duplicateSectionStrategy = async (
  trx,
  section,
  position,
  overrides = {},
  references = getDefaultReferenceStructure(),
  shouldDuplicateRouting = true
) => {
  const duplicateSection = await duplicateRecord(
    trx,
    "Sections",
    section,
    overrides,
    position
  );

  references.sections[section.id] = duplicateSection.id;

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
      references,
      false
    );
  }

  if (shouldDuplicateRouting) {
    await duplicateRouting(trx, references.pagesWithRouting, references);
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

  const references = getDefaultReferenceStructure();

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
      references,
      false
    );
  }

  await duplicateRouting(trx, references.pagesWithRouting, references);

  return duplicateQuestionnaire;
};

Object.assign(module.exports, {
  duplicatePageStrategy,
  duplicateSectionStrategy,
  duplicateQuestionnaireStrategy
});

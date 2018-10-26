const { head } = require("lodash");

const { selectData, duplicateRecord, duplicateTree } = require("./utils");
const updatePiping = require("./piping");
const duplicateRouting = require("./routing");
const duplicateAnswerStrategy = require("./answers");
const duplicateDestinations = require("./destinations");

const getDefaultReferenceStructure = () => ({
  options: {},
  answers: {},
  pages: {},
  sections: {},
  metadata: {},
  pagesWithRouting: []
});

const ENTITY_TREE = [
  // {
  //   name: "pages",
  //   table: "Pages",
  //   links: [{ column: "sectionId", entity: "sections" }]
  // },
  {
    name: "answers",
    table: "Answers",
    links: [
      {
        column: "questionPageId",
        entityName: "pages",
        parent: true
      }
    ],
    where: '"parentAnswerId" is null AND "isDeleted" = false'
  },
  [
    // Other answers
    {
      name: "answers",
      table: "Answers",
      links: [
        {
          column: "questionPageId",
          entityName: "pages",
          parent: true
        },
        {
          column: "parentAnswerId",
          entityName: "answers"
        }
      ],
      where: '"parentAnswerId" is not null AND "isDeleted" = false'
    },
    {
      name: "validations",
      table: "Validation_AnswerRules",
      links: [
        {
          column: "answerId",
          entityName: "answers",
          parent: true
        },
        {
          column: "previousAnswerId",
          entityName: "answers"
        }
      ]
    }
  ],
  {
    name: "options",
    table: "Options",
    links: [
      {
        column: "answerId",
        entityName: "answers",
        parent: true
      },
      {
        column: "otherAnswerId",
        entityName: "answers",
        parent: true
      }
    ]
  },
  {
    name: "routingRuleSets",
    table: "Routing_RuleSets",
    links: [
      {
        column: "questionPageId",
        entityName: "pages",
        parent: true
      }
    ]
  },
  {
    name: "routingRules",
    table: "Routing_Rules",
    links: [
      {
        column: "routingRuleSetId",
        entityName: "routingRuleSets",
        parent: true
      }
    ]
  },
  {
    name: "routingConditions",
    table: "Routing_Conditions",
    links: [
      {
        column: "routingRuleId",
        entityName: "routingRules",
        parent: true
      },
      {
        column: "questionPageId",
        entityName: "pages"
      },
      {
        column: "answerId",
        entityName: "answers"
      }
    ]
  },
  {
    name: "routingConditionValues",
    table: "Routing_ConditionValues",
    links: [
      {
        column: "conditionId",
        entityName: "routingConditions",
        parent: true
      },
      {
        column: "optionId",
        entityName: "options"
      }
    ]
  }
];

const duplicatePageStrategy = async (
  trx,
  page,
  position,
  overrides = {},
  references = getDefaultReferenceStructure()
) => {
  const duplicatePage = await duplicateRecord(
    trx,
    "Pages",
    page,
    {
      ...overrides
    },
    position
  );

  references.pages[page.id] = duplicatePage.id;

  await duplicateTree(trx, ENTITY_TREE, references);
  await duplicateDestinations(trx, references);

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

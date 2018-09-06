const db = require("../../db");
const { head, omit } = require("lodash");
const {
  insertData,
  selectData,
  duplicateRecord,
  duplicateOptionStrategy,
  duplicateAnswerStrategy,
  duplicatePageStrategy
} = require("./duplicateStrategy");
const QuestionnaireRepository = require("../QuestionnaireRepository");
const SectionRepository = require("../SectionRepository");
const PageRepository = require("../PageRepository");

const buildQuestionnaire = questionnaire => ({
  title: "Test questionnaire",
  surveyId: "1",
  theme: "default",
  legalBasis: "Voluntary",
  navigation: false,
  createdBy: "foo",
  ...questionnaire
});

const buildSection = section => ({
  title: "Test section",
  description: "section description",
  ...section
});

const buildPage = page => ({
  title: "Test page",
  description: "page description",
  guidance: "page description",
  pageType: "QuestionPage",
  ...page
});

const buildOption = option => ({
  label: "Test label",
  description: "Option description",
  ...option
});

const buildAnswer = answer => ({
  label: "Test label",
  description: "Answer description",
  guidance: "Answer guidance",
  type: "Radio",
  ...answer
});

const buildValidation = validation => ({
  validationType: "minValue",
  enabled: false,
  config: '{"inclusive": false}',
  ...validation
});

const setup = async () => {
  const questionnaire = await QuestionnaireRepository.insert(
    buildQuestionnaire()
  );

  const section = await SectionRepository.insert(
    buildSection({
      questionnaireId: questionnaire.id
    })
  );

  const page = await PageRepository.insert(
    buildPage({
      sectionId: section.id
    })
  );

  return { questionnaire, section, page };
};

describe("Duplicate strategy tests", () => {
  beforeAll(() => db.migrate.latest());
  afterAll(() => db.destroy());
  afterEach(() =>
    Promise.all([
      db("Questionnaires").delete(),
      db("Answers").delete(),
      db("Options").delete()
    ]));

  it("will insert data into the db correctly, given some data", async () => {
    const { section } = await setup();

    const dataToInsert = await buildPage({ SectionId: section.id });

    const dataReturnedFromInsert = await db.transaction(trx => {
      return insertData(trx, "Pages", dataToInsert, head, "*");
    });

    const dataReturnedFromSelect = await db
      .select("*")
      .from("Pages")
      .where({ id: dataReturnedFromInsert.id })
      .then(head);

    expect({
      ...dataReturnedFromInsert,
      ...dataToInsert
    }).toMatchObject(dataReturnedFromSelect);
  });

  it("will select data from the db correctly, given some previously inserted data", async () => {
    const { section } = await setup();

    const dataToInsert = buildPage({ SectionId: section.id });

    const dataReturnedFromInsert = await db.transaction(trx => {
      return insertData(trx, "Pages", dataToInsert, head, "*");
    });

    const dataReturnedFromSelect = await db.transaction(trx => {
      return selectData(trx, "Pages", "*", {
        id: dataReturnedFromInsert.id
      }).then(head);
    });

    expect(dataReturnedFromSelect).toMatchObject({
      ...dataReturnedFromInsert,
      ...dataToInsert
    });
  });

  it("will duplicate a record", async () => {
    const fieldsToOmit = ["id", "created_at", "updated_at"];
    const { section } = await setup();

    const dataToInsert = buildPage({ SectionId: section.id });

    const dataReturnedFromInsert = await db.transaction(trx => {
      return insertData(trx, "Pages", dataToInsert, head, "*");
    });

    const duplicatedRecord = await db.transaction(trx => {
      return duplicateRecord(
        trx,
        "Pages",
        omit(dataReturnedFromInsert, fieldsToOmit)
      );
    });

    expect(omit(dataReturnedFromInsert, fieldsToOmit)).toMatchObject(
      omit(duplicatedRecord, fieldsToOmit)
    );
  });

  it("will duplicate an option", async () => {
    const fieldsToOmit = ["id", "created_at", "updated_at"];

    const originalOption = await db.transaction(trx => {
      return insertData(trx, "Options", buildOption(), head, "*");
    });

    const duplicateOption = await db.transaction(trx => {
      return duplicateOptionStrategy(trx, omit(originalOption, fieldsToOmit));
    });

    expect(omit(duplicateOption, fieldsToOmit)).toMatchObject(
      omit(originalOption, fieldsToOmit)
    );
  });

  it("will duplicate an answer", async () => {
    const fieldsToOmit = ["created_at", "updated_at"];

    const originalAnswer = await db.transaction(trx => {
      return insertData(trx, "Answers", buildAnswer(), head, "*");
    });

    const duplicateAnswer = await db.transaction(trx => {
      return duplicateAnswerStrategy(trx, omit(originalAnswer, fieldsToOmit));
    });

    const fieldsToOmitIncludingId = [...fieldsToOmit, "id"];
    expect(omit(duplicateAnswer, fieldsToOmitIncludingId)).toMatchObject(
      omit(originalAnswer, fieldsToOmitIncludingId)
    );
  });

  it("will duplicate an answer with an option", async () => {
    const { page } = await setup();
    const { answer, option } = await db.transaction(async trx => {
      const answer = await insertData(
        trx,
        "Answers",
        buildAnswer({ QuestionPageId: page.id }),
        head,
        "*"
      );
      const option = await insertData(
        trx,
        "Options",
        buildOption({
          AnswerId: answer.id
        }),
        head,
        "*"
      );
      return { answer, option };
    });

    const duplicateOption = await db.transaction(async trx => {
      const duplicateAnswer = await duplicateAnswerStrategy(trx, answer);
      return selectData(trx, "Options", "*", {
        AnswerId: duplicateAnswer.id
      }).then(head);
    });
    const fieldsToIgnore = ["id", "created_at", "updated_at"];
    expect(omit(fieldsToIgnore, duplicateOption)).toMatchObject(
      omit(fieldsToIgnore, option)
    );
  });

  const insertOption = (trx, answer, label) =>
    insertData(
      trx,
      "Options",
      buildOption({
        AnswerId: answer.id,
        label
      }),
      head,
      "*"
    );

  it("will ensure the option order is maintained", async () => {
    const { page } = await setup();
    const { answer } = await db.transaction(async trx => {
      const answer = await insertData(
        trx,
        "Answers",
        buildAnswer({ QuestionPageId: page.id }),
        head,
        "*"
      );

      await insertOption(trx, answer, "1");
      await insertOption(trx, answer, "2");
      await insertOption(trx, answer, "3");
      await insertOption(trx, answer, "4");

      return { answer };
    });

    const duplicateOptions = await db.transaction(async trx => {
      const duplicateAnswer = await duplicateAnswerStrategy(trx, answer);
      return selectData(
        trx,
        "Options",
        "*",
        {
          AnswerId: duplicateAnswer.id
        },
        {
          column: "id",
          direction: "asc"
        }
      );
    });
    expect(duplicateOptions.map(o => o.label)).toMatchObject([
      "1",
      "2",
      "3",
      "4"
    ]);
  });

  it("will duplicate an answer with an other option", async () => {
    const fieldsToOmit = ["created_at", "updated_at"];
    const originalAnswer = await db.transaction(trx => {
      return insertData(trx, "Answers", buildAnswer(), head, "*");
    });
    const originalOtherAnswer = await db.transaction(trx => {
      return insertData(
        trx,
        "Answers",
        buildAnswer({
          type: "TextField",
          parentAnswerId: originalAnswer.id
        }),
        head,
        "*"
      );
    });
    const originalOption = await db.transaction(trx => {
      return insertData(
        trx,
        "Options",
        buildOption({
          AnswerId: originalAnswer.id,
          otherAnswerId: originalOtherAnswer.id
        }),
        head,
        "*"
      );
    });

    const duplicateAnswer = await db.transaction(trx => {
      return duplicateAnswerStrategy(trx, omit(originalAnswer, fieldsToOmit));
    });
    const { duplicateOption, duplicateOtherAnswer } = await db.transaction(
      async trx => {
        const duplicateOtherAnswer = await selectData(trx, "Answers", "*", {
          parentAnswerId: duplicateAnswer.id
        }).then(head);
        const duplicateOption = await selectData(trx, "Options", "*", {
          AnswerId: duplicateAnswer.id,
          otherAnswerId: duplicateOtherAnswer.id
        }).then(head);
        return { duplicateOtherAnswer, duplicateOption };
      }
    );

    const fieldsToOmitIncludingId = [...fieldsToOmit, "id"];
    expect(omit(duplicateAnswer, fieldsToOmitIncludingId)).toMatchObject(
      omit(originalAnswer, fieldsToOmitIncludingId)
    );
    expect(
      omit(duplicateOption, [
        ...fieldsToOmitIncludingId,
        "AnswerId",
        "otherAnswerId"
      ])
    ).toMatchObject(
      omit(originalOption, [
        ...fieldsToOmitIncludingId,
        "AnswerId",
        "otherAnswerId"
      ])
    );
    expect(
      omit(duplicateOtherAnswer, [...fieldsToOmitIncludingId, "parentAnswerId"])
    ).toMatchObject(
      omit(originalOtherAnswer, [...fieldsToOmitIncludingId, "parentAnswerId"])
    );
  });

  it("will duplicate a page", async () => {
    const notDuplicatedFields = ["created_at", "updated_at"];
    const { section } = await setup();
    const originalPage = await db.transaction(trx =>
      insertData(trx, "Pages", buildPage({ SectionId: section.id }), head, "*")
    );
    const duplicatePage = await db.transaction(trx =>
      duplicatePageStrategy(trx, omit(originalPage, notDuplicatedFields))
    );
    expect(omit(duplicatePage, [...notDuplicatedFields, "id"])).toMatchObject(
      omit(originalPage, [...notDuplicatedFields, "id"])
    );
  });

  it("will duplicate the answers on the page but not deleted ones", async () => {
    const notDuplicatedFields = ["created_at", "updated_at"];
    const { section } = await setup();
    const { originalPage, originalAnswer } = await db.transaction(async trx => {
      const originalPage = await insertData(
        trx,
        "Pages",
        buildPage({ SectionId: section.id }),
        head,
        "*"
      );
      const originalAnswer = await insertData(
        trx,
        "Answers",
        buildAnswer({ QuestionPageId: originalPage.id }),
        head,
        "*"
      );
      await insertData(
        trx,
        "Answers",
        buildAnswer({ QuestionPageId: originalPage.id, isDeleted: true }),
        head,
        "*"
      );
      return { originalPage, originalAnswer };
    });
    const duplicatePage = await db.transaction(trx =>
      duplicatePageStrategy(trx, omit(originalPage, notDuplicatedFields))
    );

    const duplicateAnswers = await db.transaction(trx =>
      selectData(trx, "Answers", "*", {
        QuestionPageId: duplicatePage.id
      })
    );
    expect(duplicateAnswers).toHaveLength(1);
    const firstAnswer = head(duplicateAnswers);
    expect(
      omit(firstAnswer, [...notDuplicatedFields, "id", "QuestionPageId"])
    ).toMatchObject(
      omit(originalAnswer, [...notDuplicatedFields, "id", "QuestionPageId"])
    );
  });

  it("will duplicate the validations for an answer", async () => {
    const { section } = await setup();
    const { duplicatedAnswer, originalValidation } = await db.transaction(
      async trx => {
        const originalPage = await insertData(
          trx,
          "Pages",
          buildPage({ SectionId: section.id }),
          head,
          "*"
        );
        const originalAnswer = await insertData(
          trx,
          "Answers",
          buildAnswer({ QuestionPageId: originalPage.id }),
          head,
          "*"
        );
        const originalValidation = await insertData(
          trx,
          "Validation_AnswerRules",
          buildValidation({ AnswerId: originalAnswer.id }),
          head,
          "*"
        );
        const duplicatedAnswer = await duplicateAnswerStrategy(
          trx,
          originalAnswer
        );
        return { duplicatedAnswer, originalValidation };
      }
    );

    const duplicatedValidation = await db.transaction(trx =>
      selectData(trx, "Validation_AnswerRules", "*", {
        AnswerId: duplicatedAnswer.id
      }).then(head)
    );
    const fieldsToIgnore = ["id", "created_at", "updated_at", "AnswerId"];

    expect(omit(duplicatedValidation, fieldsToIgnore)).toMatchObject(
      omit(originalValidation, fieldsToIgnore)
    );
  });
});

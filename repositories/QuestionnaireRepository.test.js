const knex = require("../db/index");

const createQuestionnaireTable = require("../migrations/20170620163533_create_questionnaires_table");
const addSummaryColumn = require("../migrations/20171116131851_add_summary_column");
const QuestionnaireRepository = require("../repositories/QuestionnaireRepository");

const buildQuestionnaire = (json = {}) => {
  return Object.assign(
    {
      title: "Test questionnaire",
      surveyId: "1",
      theme: "default",
      legalBasis: "Voluntary",
      navigation: 0
    },
    json
  );
};

describe("QuestionnaireRepository", () => {
  let questionnaire;

  beforeEach(async () => {
    await createQuestionnaireTable.up(knex);
    await addSummaryColumn.up(knex);
    await knex.schema.table("Questionnaires", t =>
      t
        .boolean("isDeleted")
        .notNull()
        .defaultTo(false)
    );
    questionnaire = buildQuestionnaire();
  });

  it("should create new Questionnaire", () => {
    return QuestionnaireRepository.insert(questionnaire).then(result =>
      expect(result).toEqual(1)
    );
  });

  it("should retrieve a single questionnaire", () => {
    return QuestionnaireRepository.insert(questionnaire).then(() => {
      expect(QuestionnaireRepository.get(1)).resolves.toMatchObject(
        questionnaire
      );
    });
  });

  it("should retrieve all questionnaires", () => {
    return QuestionnaireRepository.insert(questionnaire)
      .then(() =>
        QuestionnaireRepository.insert(buildQuestionnaire({ surveyId: 2 }))
      )
      .then(() => QuestionnaireRepository.findAll())
      .then(result => {
        expect(result).toMatchObject([
          {
            id: 1,
            isDeleted: 0
          },
          {
            id: 2,
            isDeleted: 0
          }
        ]);
      });
  });

  it("should remove questionnaire", () => {
    return QuestionnaireRepository.insert(questionnaire)
      .then(() => QuestionnaireRepository.findAll())
      .then(result => {
        return expect(result).toMatchObject([
          {
            id: 1,
            isDeleted: 0
          }
        ]);
      })
      .then(() => QuestionnaireRepository.remove(1))
      .then(() => QuestionnaireRepository.findAll())
      .then(result => {
        return expect(result).toMatchObject([]);
      });
  });

  it("should remove the correct questionnaire", () => {
    return QuestionnaireRepository.insert(questionnaire)
      .then(() =>
        QuestionnaireRepository.insert(buildQuestionnaire({ surveyId: 2 }))
      )
      .then(() => QuestionnaireRepository.findAll())
      .then(result => {
        return expect(result).toMatchObject([
          {
            id: 1,
            isDeleted: 0
          },
          {
            id: 2,
            isDeleted: 0
          }
        ]);
      })
      .then(() => QuestionnaireRepository.remove(2))
      .then(() => QuestionnaireRepository.findAll())
      .then(result => {
        return expect(result).toMatchObject([
          {
            id: 1,
            isDeleted: 0
          }
        ]);
      });
  });

  it("should update questionnaires", () => {
    return QuestionnaireRepository.insert(questionnaire)
      .then(() =>
        QuestionnaireRepository.update({ id: 1, surveyId: "updated" })
      )
      .then(() => QuestionnaireRepository.get(1))
      .then(result => {
        expect(result).toMatchObject({
          surveyId: "updated"
        });
      });
  });

  afterEach(async () => {
    await addSummaryColumn.down(knex);
    await createQuestionnaireTable.down(knex);
  });

  afterAll(() => {
    knex.destroy();
  });
});

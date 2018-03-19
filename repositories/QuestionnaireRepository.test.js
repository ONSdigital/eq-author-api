const knex = require("../db");
const QuestionnaireRepository = require("../repositories/QuestionnaireRepository");

const buildQuestionnaire = (json = {}) => {
  return Object.assign(
    {
      title: "Test questionnaire",
      surveyId: "1",
      theme: "default",
      legalBasis: "Voluntary",
      navigation: false,
      createdBy: "foo"
    },
    json
  );
};

describe("QuestionnaireRepository", () => {
  beforeAll(() => knex.migrate.latest());
  afterAll(() => knex.migrate.rollback().then(() => knex.destroy()));
  afterEach(() => knex("Questionnaires").delete());

  it("should create new Questionnaire", async () => {
    const questionnaire = buildQuestionnaire({
      title: "creating a new questionnaire "
    });
    const result = await QuestionnaireRepository.insert(questionnaire);

    expect(result).toMatchObject(questionnaire);
  });

  it("should retrieve a single questionnaire", async () => {
    const questionnaire = buildQuestionnaire({ title: "foo bar" });

    const { id } = await QuestionnaireRepository.insert(questionnaire);

    const result = await QuestionnaireRepository.get(id);

    expect(result.id).toBe(id);
    expect(result).toMatchObject(questionnaire);
  });

  it("should retrieve all questionnaires", async () => {
    const { id: id1 } = await QuestionnaireRepository.insert(
      buildQuestionnaire()
    );
    const { id: id2 } = await QuestionnaireRepository.insert(
      buildQuestionnaire({ surveyId: 2 })
    );

    const results = await QuestionnaireRepository.findAll();

    expect(results).toContainEqual(
      expect.objectContaining({ id: id1, isDeleted: false })
    );
    expect(results).toContainEqual(
      expect.objectContaining({ id: id2, isDeleted: false })
    );
  });

  it("should remove questionnaire", async () => {
    const { id } = await QuestionnaireRepository.insert(buildQuestionnaire());

    await QuestionnaireRepository.remove(id);
    const result = await QuestionnaireRepository.get(id);

    expect(result).toMatchObject({});
  });

  it("should update questionnaires", async () => {
    const { id } = await QuestionnaireRepository.insert(buildQuestionnaire());
    const result = await QuestionnaireRepository.update({
      id,
      surveyId: "456"
    });

    expect(result).toMatchObject({ surveyId: "456" });
  });
});
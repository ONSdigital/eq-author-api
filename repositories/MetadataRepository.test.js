const { map, times, omit } = require("lodash");

const db = require("../db");
const QuestionnaireRepository = require("../repositories/QuestionnaireRepository");
const MetadataRepository = require("../repositories/MetadataRepository");

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

const buildMetadata = (questionnaireId, json = {}) => {
  return Object.assign(
    {
      type: "Text",
      questionnaireId: questionnaireId
    },
    json
  );
};

describe("MetadataRepository", () => {
  let questionnaireId;

  beforeAll(() => db.migrate.latest());
  afterAll(() => db.destroy());
  afterEach(() => db("Questionnaires").delete());
  beforeEach(async () => {
    const questionnaire = buildQuestionnaire({ title: "New questionnaire" });
    ({ id: questionnaireId } = await QuestionnaireRepository.insert(
      questionnaire
    ));
  });

  it("should retrieve a single Metadata", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);
    const result = await MetadataRepository.getById(id);

    expect(result.id).toBe(id);
    expect(result).toMatchObject({
      type: "Text",
      questionnaireId
    });
  });

  it("should retrieve all Metadata", async () => {
    const metadata = times(4, async () => {
      const metadata = buildMetadata(questionnaireId);
      const { id } = await MetadataRepository.insert(metadata);
      return id;
    });
    const metadataIds = await Promise.all(metadata);
    const results = map(await MetadataRepository.findAll(), "id");
    expect(results).toEqual(expect.arrayContaining(metadataIds));
  });

  it("should create new Metadata", async () => {
    const metadata = buildMetadata(questionnaireId);
    const result = await MetadataRepository.insert(metadata);
    expect(result).toMatchObject({
      type: "Text",
      questionnaireId
    });
  });

  it("should update Metadata - text", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);

    const updateValues = {
      id,
      key: "ru_ref",
      alias: "Reporting Unit Reference",
      type: "Text",
      textValue: "10000000",
      questionnaireId: questionnaireId
    };

    const result = await MetadataRepository.update(updateValues);

    expect(result).toMatchObject(
      omit({ ...updateValues, value: "10000000" }, ["textValue"])
    );
  });

  it("should update Metadata - date", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);

    const updateValues = {
      id,
      key: "ru_ref",
      alias: "Reporting Unit Reference",
      type: "Date",
      dateValue: new Date("2018-09-04"),
      questionnaireId: questionnaireId
    };

    const result = await MetadataRepository.update(updateValues);

    expect(result).toMatchObject(
      omit(
        {
          ...updateValues,
          value: expect.stringContaining("2018-09-04")
        },
        ["dateValue"]
      )
    );
  });

  it("should update Metadata - region", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);

    const updateValues = {
      id,
      key: "ru_ref",
      alias: "Reporting Unit Reference",
      type: "Region",
      regionValue: "GB_ENG",
      questionnaireId: questionnaireId
    };

    const result = await MetadataRepository.update(updateValues);

    expect(result).toMatchObject(
      omit({ ...updateValues, value: "GB_ENG" }, ["regionValue"])
    );
  });

  it("should update Metadata - language", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);

    const updateValues = {
      id,
      key: "ru_ref",
      alias: "Reporting Unit Reference",
      type: "Language",
      languageValue: "cy",
      questionnaireId: questionnaireId
    };

    const result = await MetadataRepository.update(updateValues);

    expect(result).toMatchObject(
      omit({ ...updateValues, value: "cy" }, ["languageValue"])
    );
  });

  it("should remove Metadata", async () => {
    const metadata = buildMetadata(questionnaireId);
    const { id } = await MetadataRepository.insert(metadata);
    await MetadataRepository.remove(id);
    const result = await MetadataRepository.getById(id);
    expect(result).toBeUndefined();
  });
});

const { first } = require("lodash");
const repositories = require("../repositories");
const db = require("../db");
const executeQuery = require("../tests/utils/executeQuery");
const {
  createQuestionnaireMutation,
  createAnswerMutation,
  createOtherMutation,
  deleteOtherMutation,
  getAnswerQuery,
  getAnswersQuery,
  createRoutingRuleSetMutation,
  createRoutingRule,
  createRoutingCondition,
  toggleConditionOption,
  getEntireRoutingStructure,
  getBasicRoutingQuery
} = require("../tests/utils/graphql");

const ctx = { repositories };

const createNewQuestionnaire = async () => {
  const input = {
    title: "Test Questionnaire",
    description: "Questionnaire created by integration test.",
    theme: "default",
    legalBasis: "Voluntary",
    navigation: false,
    surveyId: "001",
    summary: true,
    createdBy: "Integration test"
  };

  const result = await executeQuery(
    createQuestionnaireMutation,
    { input },
    ctx
  );
  return result.data.createQuestionnaire;
};

const createNewAnswer = async ({ id: pageId }, type) => {
  const input = {
    description: "",
    guidance: "",
    label: `${type} answer`,
    qCode: null,
    type: `${type}`,
    mandatory: false,
    questionPageId: pageId
  };

  const result = await executeQuery(createAnswerMutation, { input }, ctx);
  return result.data.createAnswer;
};

const createNewOtherMutation = async answer =>
  executeQuery(
    createOtherMutation,
    { input: { parentAnswerId: answer.id } },
    ctx
  );

const createOther = async answer => {
  const result = await createNewOtherMutation(answer);
  return result.data.createOther;
};

const deleteOther = async answer =>
  executeQuery(
    deleteOtherMutation,
    {
      input: {
        parentAnswerId: answer.id
      }
    },
    ctx
  );

const createThenDeleteOther = async (page, type) => {
  const answer = await createNewAnswer(page, type);
  await createOther(answer);
  await deleteOther(answer);

  return answer;
};

const createNewRoutingRuleMutation = async ({ routingRuleSet, id }) =>
  executeQuery(
    createRoutingRule,
    {
      input: {
        operation: "And",
        routingRuleSetId: routingRuleSet.id,
        goto: {
          pageId: id
        }
      }
    },
    ctx
  );

const createNewRoutingRule = async page => {
  const result = await createNewRoutingRuleMutation(page);
  return result.data;
};

const createNewRoutingConditionMutation = async (routingRuleId, answerId) =>
  executeQuery(
    createRoutingCondition,
    {
      input: {
        comparator: "Equal",
        routingRuleId,
        answerId
      }
    },
    ctx
  );

const createNewRoutingCondition = async (routingRuleId, pageId) => {
  const answer = await createNewAnswer(pageId, "Checkbox");
  let result = await createNewRoutingConditionMutation(
    routingRuleId.id,
    answer.id
  );

  result = result.data;
  return { result, answer };
};

const toggleNewConditionValue = async ({ result, answer }) => {
  const conditionValue = await toggleNewConditionValueMutation(
    result.createRoutingCondition.id,
    first(answer.options).id
  );
  return conditionValue.data;
};

const toggleNewConditionValueMutation = async (conditionId, optionId) =>
  executeQuery(
    toggleConditionOption,
    {
      input: {
        conditionId,
        optionId,
        checked: true
      }
    },
    ctx
  );

const refreshAnswerDetails = async ({ id }) => {
  const result = await executeQuery(getAnswerQuery, { id }, ctx);
  return result.data.answer;
};

describe("resolvers", () => {
  let questionnaire;
  let sections;
  let pages;
  let firstPage;

  beforeAll(() => db.migrate.latest());
  afterAll(() => db.migrate.rollback().then(() => db.destroy()));
  afterEach(() => db("Questionnaires").delete());

  beforeEach(async () => {
    questionnaire = await createNewQuestionnaire();
    sections = questionnaire.sections;
    pages = first(sections).pages;
    firstPage = first(pages);
  });

  it("should create other answer for Checkbox answers", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    expect(checkboxAnswer.other).toBeNull();

    const other = await createOther(checkboxAnswer);
    expect(other.answer).toMatchObject({ type: "TextField", description: "" });

    const updatedCheckboxAnswer = await refreshAnswerDetails(checkboxAnswer);
    expect(updatedCheckboxAnswer.other).not.toBeNull();
    expect(updatedCheckboxAnswer.other).toMatchObject(other);
  });

  it("should create other answer for Radio answers", async () => {
    const radioAnswer = await createNewAnswer(firstPage, "Radio");
    expect(radioAnswer.other).toBeNull();

    const other = await createOther(radioAnswer);
    expect(other.answer).toMatchObject({ type: "TextField" });

    const updatedRadioAnswer = await refreshAnswerDetails(radioAnswer);
    expect(updatedRadioAnswer.other).not.toBeNull();
    expect(updatedRadioAnswer.other).toMatchObject(other);
  });

  it("should throw error when creating other answer for BasicAnswer", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    const result = await createNewOtherMutation(textAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should throw error when deleting other answer for BasicAnswer", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    const result = await deleteOther(textAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should return undefined when accessing other property on BasicAnswers", async () => {
    const textAnswer = await createNewAnswer(firstPage, "TextField");
    expect(textAnswer.other).toBeUndefined();
  });

  it("should delete other answer for Checkbox answers", async () => {
    const parentAnswer = await createThenDeleteOther(firstPage, "Checkbox");
    const checkboxAnswer = await refreshAnswerDetails(parentAnswer);

    expect(checkboxAnswer.other).toBeNull();
  });

  it("should delete other answer for Radio answers", async () => {
    const parentAnswer = await createThenDeleteOther(firstPage, "Radio");
    const radioAnswer = await refreshAnswerDetails(parentAnswer);

    expect(radioAnswer.other).toBeNull();
  });

  it("should not create a new other answer if one already exists", async () => {
    const parentAnswer = await createNewAnswer(firstPage, "Checkbox");
    const other = await createOther(parentAnswer);

    expect(createOther(parentAnswer)).resolves.toBeNull();

    const updatedParent = await refreshAnswerDetails(parentAnswer);
    expect(updatedParent.other).toMatchObject(other);
  });

  it("should filter out Other answers from regular answers", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createOther(checkboxAnswer);

    const textFieldAnswer = await createNewAnswer(firstPage, "TextField");

    const result = await executeQuery(
      getAnswersQuery,
      { id: firstPage.id },
      ctx
    );
    expect(result.data.page.answers).toHaveLength(2);
    expect(result.data.page.answers).toContainEqual({
      id: checkboxAnswer.id,
      type: checkboxAnswer.type
    });
    expect(result.data.page.answers).toContainEqual({
      id: textFieldAnswer.id,
      type: textFieldAnswer.type
    });
  });

  it("should create an other option while creating an other answer", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createOther(checkboxAnswer);
    const refreshedCheckbox = await refreshAnswerDetails(checkboxAnswer);
    expect(refreshedCheckbox.other.option).not.toBeNull();
    expect(refreshedCheckbox.other.option).toHaveProperty("id");
  });

  it("should not return 'other' option with regular checkbox/radio options", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    await createOther(checkboxAnswer);
    const refreshedCheckbox = await refreshAnswerDetails(checkboxAnswer);
    expect(refreshedCheckbox.options).toHaveLength(1);
    expect(refreshedCheckbox.options).not.toContainEqual({
      id: refreshedCheckbox.other.option.id
    });
  });

  it("should return an error when trying to delete a non-existent other Answer", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    const result = await deleteOther(checkboxAnswer);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
  });

  it("should return an error when trying to create other answer when one already exists", async () => {
    const checkboxAnswer = await createNewAnswer(firstPage, "Checkbox");
    const firstAttempt = await createNewOtherMutation(checkboxAnswer);
    const secondAttempt = await createNewOtherMutation(checkboxAnswer);

    expect(firstAttempt).not.toHaveProperty("errors");

    expect(secondAttempt).toHaveProperty("errors");
    expect(secondAttempt.errors).toHaveLength(1);
  });

  it("should create a RoutingRule set on questionPage creation", async () => {
    const result = await executeQuery(
      getEntireRoutingStructure,
      { id: firstPage.id },
      ctx
    );
    expect(result.data.questionPage.routingRuleSet.id).not.toBeNull();
  });

  it("can create a RoutingRule, RoutingCondtion and can toggle a optionValue on", async () => {
    const result = await executeQuery(
      getBasicRoutingQuery,
      { id: firstPage.id },
      ctx
    );
    const routingRule = await createNewRoutingRule(result.data.page);

    const routingCondition = await createNewRoutingCondition(
      routingRule.createRoutingRule,
      firstPage
    );
    const routingConditionValue = await toggleNewConditionValue(
      routingCondition
    );

    expect(routingRule.createRoutingRule.id).toHaveLength(1);
    expect(routingCondition.result.createRoutingCondition.id).toHaveLength(1);
    expect(routingConditionValue.toggleConditionOption.value).toHaveLength(1);
  });
});

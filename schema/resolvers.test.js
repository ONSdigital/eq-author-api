const { first, get } = require("lodash");
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
  createRoutingRuleSet,
  createRoutingCondition,
  toggleConditionOption,
  getEntireRoutingStructure,
  getBasicRoutingQuery,
  updateConditionAnswer,
  createSectionMutation,
  createQuestionPageMutation,
  getAvalableRoutingDestinations
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

const createNewRoutingRuleSet = async questionPageId => {
  return executeQuery(
    createRoutingRuleSet,
    {
      input: {
        questionPageId
      }
    },
    ctx
  );
};

const createNewRoutingConditionMutation = async (routingRuleId, { id }) =>
  executeQuery(
    createRoutingCondition,
    {
      input: {
        comparator: "Equal",
        routingRuleId,
        answerId: id
      }
    },
    ctx
  );

const createNewRoutingCondition = async (routingRuleId, pageId) => {
  const answer = await createNewAnswer(pageId, "Checkbox");
  const result = await createNewRoutingConditionMutation(routingRuleId, answer);
  return { result, answer };
};

const toggleNewConditionValueMutation = async (conditionId, optionId, toggle) =>
  executeQuery(
    toggleConditionOption,
    {
      input: {
        conditionId,
        optionId,
        checked: toggle
      }
    },
    ctx
  );

const toggleNewConditionValue = async ({ result, answer }, toggle = true) => {
  const conditionValue = await toggleNewConditionValueMutation(
    result.data.createRoutingCondition.id,
    first(answer.options).id,
    toggle
  );
  return conditionValue.data;
};

const changeRoutingConditionMutation = async (
  answer,
  { createRoutingCondition }
) =>
  executeQuery(
    updateConditionAnswer,
    {
      input: {
        id: createRoutingCondition.id,
        answerId: answer.id
      }
    },
    ctx
  );

const changeRoutingCondition = async ({ answer, result }) => {
  const RoutingCondition = await changeRoutingConditionMutation(
    answer,
    result.data
  );
  return RoutingCondition.data;
};

const createFullRoutingTree = async firstPage => {
  await createNewRoutingRuleSet(firstPage.id);
  const result = await executeQuery(
    getBasicRoutingQuery,
    { id: firstPage.id },
    ctx
  );
  const routingRuleId = get(
    result,
    "data.page.routingRuleSet.routingRules[0].id"
  );
  const routingCondition = await createNewRoutingCondition(
    routingRuleId,
    firstPage
  );
  const routingConditionValue = await toggleNewConditionValue(routingCondition);

  return { routingRuleId, routingCondition, routingConditionValue };
};

const getFullRoutingTree = async firstPage =>
  executeQuery(getEntireRoutingStructure, { id: firstPage.id }, ctx);

const createQuestionPage = async id =>
  executeQuery(
    createQuestionPageMutation,
    { input: { title: "Bar", sectionId: id } },
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

  it("should create a RoutingRule on RoutingRuleSet creation", async () => {
    const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
    const result = await executeQuery(
      getBasicRoutingQuery,
      { id: firstPage.id },
      ctx
    );

    expect(routingRuleSet).toMatchSnapshot();
    expect(get(result, "data.page.routingRuleSet.routingRules")).toHaveLength(
      1
    );
  });

  it("can create a RoutingCondtion and can toggle a optionValue on and off", async () => {
    const routingTree = await createFullRoutingTree(firstPage);
    let routingStructure = await getFullRoutingTree(firstPage);

    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions"
      )
    ).toHaveLength(1);
    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
      )
    ).toHaveLength(1);

    await toggleNewConditionValue(routingTree.routingCondition, false);

    routingStructure = await getFullRoutingTree(firstPage);
    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
      )
    ).toHaveLength(0);
  });

  it("should delete all optionValues when the RoutingCondition Answeris is updated", async () => {
    const routingTree = await createFullRoutingTree(firstPage);
    await toggleNewConditionValue(routingTree.routingCondition);
    await toggleNewConditionValue(routingTree.routingCondition);

    let routingStructure = await getFullRoutingTree(firstPage);
    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
      )
    ).toHaveLength(3);

    await changeRoutingCondition(routingTree.routingCondition);

    routingStructure = await getFullRoutingTree(firstPage);
    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
      )
    ).toHaveLength(3);

    const answer = await createNewAnswer(firstPage, "Checkbox");
    const result = get(routingTree, "routingCondition.result");
    await changeRoutingCondition({ answer, result });

    routingStructure = await getFullRoutingTree(firstPage);
    expect(
      get(
        routingStructure,
        "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
      )
    ).toHaveLength(0);
  });

  it("can get all suitable routing destinations", async () => {
    const secondSection = await executeQuery(
      createSectionMutation,
      {
        input: {
          title: "Foo",
          questionnaireId: questionnaire.id
        }
      },
      ctx
    );

    await createQuestionPage(get(sections, "[0].id"));
    await createQuestionPage(get(sections, "[0].id"));
    await createQuestionPage(secondSection.data.createSection.id);

    const result = await executeQuery(
      getAvalableRoutingDestinations,
      {
        id: questionnaire.id
      },
      ctx
    );
    expect(result).toMatchSnapshot();
    expect(result.data.availableRoutingDestinations).toHaveLength(3);
  });
});

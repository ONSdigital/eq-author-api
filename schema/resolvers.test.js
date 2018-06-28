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
  getPageQuery,
  getAnswersQuery,
  createRoutingRuleSet,
  updateRoutingRule,
  toggleConditionOption,
  getEntireRoutingStructure,
  getBasicRoutingQuery,
  updateCondition,
  createSectionMutation,
  createQuestionPageMutation,
  getAvailableRoutingDestinations,
  updateRoutingRuleSet,
  deleteRoutingRuleSet,
  createRoutingRule,
  deleteRoutingRule,
  createRoutingCondition,
  deleteRoutingCondition,
  deletePageMutation,
  deleteAnswerMutation,
  deleteOptionMutation
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

const createSection = async questionnaireId =>
  executeQuery(
    createSectionMutation,
    {
      input: {
        title: "Foo",
        questionnaireId: questionnaireId
      }
    },
    ctx
  );

const createNewAnswer = async ({ id: pageId }, type) => {
  const input = {
    description: "",
    guidance: "",
    label: `${type} answer`,
    qCode: null,
    type: `${type}`,
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

const deleteQuestionPage = async input =>
  executeQuery(
    deletePageMutation,
    {
      input
    },
    ctx
  );

const deleteAnswer = async ({ id }) =>
  executeQuery(
    deleteAnswerMutation,
    {
      input: {
        id
      }
    },
    ctx
  );

const deleteOption = async input =>
  executeQuery(
    deleteOptionMutation,
    {
      input
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

const deleteRoutingRuleSetMutation = async id => {
  return executeQuery(
    deleteRoutingRuleSet,
    {
      input: {
        id
      }
    },
    ctx
  );
};

const createNewRoutingRule = async input => {
  return executeQuery(
    createRoutingRule,
    {
      input
    },
    ctx
  );
};

const createNewRoutingCondition = async input => {
  return executeQuery(
    createRoutingCondition,
    {
      input
    },
    ctx
  );
};

const updateRoutingRuleSetMutation = async input =>
  executeQuery(
    updateRoutingRuleSet,
    {
      input
    },
    ctx
  );

const updateRoutingRuleMutation = (destinationType, destinationId, id) =>
  executeQuery(
    updateRoutingRule,
    {
      input: {
        id,
        operation: "And",
        goto: {
          absoluteDestination: {
            destinationType,
            destinationId
          }
        }
      }
    },
    ctx
  );

const deleteRoutingRuleMutation = async input =>
  executeQuery(
    deleteRoutingRule,
    {
      input
    },
    ctx
  );

const deleteRoutingConditionMutation = async input =>
  executeQuery(
    deleteRoutingCondition,
    {
      input
    },
    ctx
  );

const toggleConditionOptionMutation = async (
  conditionId,
  checked,
  optionId = null
) =>
  executeQuery(
    toggleConditionOption,
    {
      input: {
        conditionId,
        optionId,
        checked
      }
    },
    ctx
  );

const changeRoutingConditionMutation = async input =>
  executeQuery(
    updateCondition,
    {
      input
    },
    ctx
  );

const changeRoutingCondition = async (firstPage, answer, conditionId) => {
  const RoutingCondition = await changeRoutingConditionMutation({
    id: conditionId,
    questionPageId: firstPage.id,
    answerId: answer.id
  });
  return RoutingCondition.data;
};

const createFullRoutingTree = async firstPage => {
  await createNewRoutingRuleSet(firstPage.id);
  const result = await executeQuery(
    getBasicRoutingQuery,
    { id: firstPage.id },
    ctx
  );
  const routingConditionId = get(
    result,
    "data.page.routingRuleSet.routingRules[0].conditions[0].id"
  );

  const answer = await createNewAnswer(firstPage, "Checkbox");

  const routingConditionValue = await toggleConditionOptionMutation(
    routingConditionId,
    true,
    first(answer.options).id
  ).then(res => res.data);

  return { routingConditionId, answer, routingConditionValue };
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

  it("should create a RoutingRule and RoutingCondition on RoutingRuleSet creation", async () => {
    await createNewRoutingRuleSet(firstPage.id);
    const result = await executeQuery(
      getBasicRoutingQuery,
      { id: firstPage.id },
      ctx
    );

    expect(get(result, "data.page.routingRuleSet.routingRules")).toHaveLength(
      1
    );

    expect(
      get(result, "data.page.routingRuleSet.routingRules[0].conditions")
    ).toHaveLength(1);
  });

  it("should delete routing rule set", async () => {
    const routingRuleSet = await createNewRoutingRuleSet(firstPage.id).then(
      res => res.data.createRoutingRuleSet
    );

    const result = await deleteRoutingRuleSetMutation(routingRuleSet.id);

    expect(result).toMatchObject({
      data: {
        deleteRoutingRuleSet: {
          id: routingRuleSet.id
        }
      }
    });

    expect(
      executeQuery(getBasicRoutingQuery, { id: firstPage.id }, ctx)
    ).resolves.toMatchObject({
      data: {
        page: {
          id: firstPage.id,
          routingRuleSet: null
        }
      }
    });
  });

  it("should error if you make a second RoutingRuleSet on one question", async () => {
    await createNewRoutingRuleSet(firstPage.id);
    const secondAttempt = await createNewRoutingRuleSet(firstPage.id);

    expect(secondAttempt.errors).toHaveLength(1);
  });

  it("should error if you try route the question to itself", async () => {
    const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
    const ruleId = get(
      routingRuleSet,
      "data.createRoutingRuleSet.routingRules[0].id"
    );
    const page = await executeQuery(getPageQuery, { id: firstPage.id }, ctx);
    const result = await updateRoutingRuleMutation(
      "QuestionPage",
      page.id,
      ruleId
    );

    expect(result.errors).toHaveLength(1);
  });

  it("should error if you route it to the beginning of its own section", async () => {
    const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
    const page = await executeQuery(getPageQuery, { id: firstPage.id }, ctx);
    const result = await updateRoutingRuleSetMutation(
      get(routingRuleSet, "data.createRoutingRuleSet.id"),
      {
        else: {
          absoluteDestination: {
            destinationType: "Section",
            destinationId: get(page, "data.questionPage.section.id")
          }
        }
      }
    );
    expect(result.errors).toHaveLength(1);
  });

  it("can create a Routing Condition and can toggle a optionValue on", async () => {
    const routingTree = await createFullRoutingTree(firstPage);
    let routingStructure = await getFullRoutingTree(firstPage);

    let routingConditions = get(
      routingStructure,
      "data.questionPage.routingRuleSet.routingRules[0].conditions"
    );

    expect(routingConditions).toHaveLength(1);
    expect(get(first(routingConditions), "routingValue.value[0]")).toEqual(
      get(routingTree, "answer.options[0].id")
    );

    await toggleConditionOptionMutation(
      routingTree.routingConditionId,
      false,
      get(routingTree, "answer.options[0].id")
    );

    routingStructure = await getFullRoutingTree(firstPage);

    routingConditions = get(
      routingStructure,
      "data.questionPage.routingRuleSet.routingRules[0].conditions"
    );

    expect(get(first(routingConditions), "routingValue.value")).toHaveLength(0);
  });

  it("should delete routing condition value when answer is updated", async () => {
    const routingTree = await createFullRoutingTree(firstPage);

    await toggleConditionOptionMutation(
      routingTree.routingConditionId,
      true,
      first(routingTree.answer.options).id
    );

    let routingStructure = await getFullRoutingTree(firstPage);

    let routingCondition = get(
      routingStructure,
      "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
    );

    expect(get(routingCondition, "routingValue.value[0]")).toEqual(
      first(routingTree.answer.options).id
    );

    await changeRoutingCondition(
      firstPage,
      routingTree.answer,
      routingTree.routingConditionId
    );

    routingStructure = await getFullRoutingTree(firstPage);
    routingCondition = get(
      routingStructure,
      "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
    );

    expect(get(routingCondition, "routingValue.value")).toHaveLength(0);
  });

  it("should return available routing destinations", async () => {
    const secondSection = await createSection(questionnaire.id);
    await createQuestionPage(get(sections, "[0].id"));
    await createQuestionPage(get(sections, "[0].id"));
    await createQuestionPage(secondSection.data.createSection.id);
    const result = await executeQuery(
      getAvailableRoutingDestinations,
      {
        id: firstPage.id
      },
      ctx
    );

    const destinations = get(result, "data.availableRoutingDestinations");

    expect(get(destinations, "logicalDestinations")).toHaveLength(2);
    expect(get(destinations, "questionPages")).toHaveLength(2);
    expect(get(destinations, "sections")).toHaveLength(1);
  });

  describe("routing", () => {
    const mutate = async input => createNewRoutingRule(input);
    const newRoutingRule = async input =>
      mutate(input).then(res => res.data.createRoutingRule);
    const addPage = async sectionId =>
      createQuestionPage(sectionId).then(res => res.data.createQuestionPage);
    const addSection = async questionnaireId =>
      createSection(questionnaireId).then(res => res.data.createSection);
    const getRoutingDataForPage = async page =>
      getFullRoutingTree(page).then(res => res.data.questionPage);
    const deleteRoutingRule = async input => deleteRoutingRuleMutation(input);

    describe("routing rule sets", () => {
      it("should default else to next page", async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
        expect(routingRuleSet).toMatchObject({
          data: {
            createRoutingRuleSet: {
              else: {
                logicalDestination: "NextPage"
              }
            }
          }
        });
      });

      it("should update else to end of questionnaire", async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);

        const updated = await updateRoutingRuleSetMutation({
          id: get(routingRuleSet, "data.createRoutingRuleSet.id"),
          else: {
            logicalDestination: {
              destinationType: "EndOfQuestionnaire"
            }
          }
        });

        expect(updated).toMatchObject({
          data: {
            updateRoutingRuleSet: {
              else: {
                logicalDestination: "EndOfQuestionnaire"
              }
            }
          }
        });
      });

      it("should update else to question page", async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
        const section = first(sections);
        const newPage = await addPage(section.id);

        const updated = await updateRoutingRuleSetMutation({
          id: get(routingRuleSet, "data.createRoutingRuleSet.id"),
          else: {
            absoluteDestination: {
              destinationType: "QuestionPage",
              destinationId: `${newPage.id}`
            }
          }
        });

        expect(updated).toMatchObject({
          data: {
            updateRoutingRuleSet: {
              else: {
                absoluteDestination: newPage
              }
            }
          }
        });
      });

      it("should update else to section", async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id);
        const newSection = await addSection(questionnaire.id);

        const updated = await updateRoutingRuleSetMutation({
          id: get(routingRuleSet, "data.createRoutingRuleSet.id"),
          else: {
            absoluteDestination: {
              destinationType: "Section",
              destinationId: `${newSection.id}`
            }
          }
        });

        expect(updated).toMatchObject({
          data: {
            updateRoutingRuleSet: {
              else: {
                absoluteDestination: newSection
              }
            }
          }
        });
      });
    });

    describe("routing rules", () => {
      let input;

      beforeEach(async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id).then(
          result => result.data.createRoutingRuleSet
        );
        input = {
          operation: "And",
          routingRuleSetId: routingRuleSet.id
        };
      });

      it("should default goto next page", async () => {
        const routingRule = await newRoutingRule(input);

        expect(routingRule).toMatchObject({
          goto: {
            logicalDestination: "NextPage"
          }
        });
      });

      it("should create a routing rule that routes to a question page", async () => {
        const section = first(sections);
        const newPage = await addPage(section.id);
        const routingRule = await newRoutingRule(input);

        const result = await updateRoutingRuleMutation(
          "QuestionPage",
          newPage.id,
          routingRule.id
        );

        expect(result).toMatchObject({
          data: {
            updateRoutingRule: {
              goto: {
                absoluteDestination: {
                  id: newPage.id,
                  __typename: "QuestionPage"
                }
              }
            }
          }
        });
      });

      it("create a routing rule that routes to another section", async () => {
        const newSection = await addSection(questionnaire.id);
        const routingRule = await newRoutingRule(input);

        const result = await updateRoutingRuleMutation(
          "Section",
          newSection.id,
          routingRule.id
        );

        expect(result).toMatchObject({
          data: {
            updateRoutingRule: {
              goto: {
                absoluteDestination: {
                  id: newSection.id,
                  __typename: "Section"
                }
              }
            }
          }
        });
      });

      it("should create a condition for newly created routing rule", async () => {
        const routingRule = await newRoutingRule(input);
        expect(get(routingRule, "conditions")).toHaveLength(1);
      });

      it("should be possible to delete a routing rule", async () => {
        const routingRule = await newRoutingRule(input);
        const page = await getRoutingDataForPage(firstPage);
        expect(page.routingRuleSet.routingRules).toHaveLength(2);

        await deleteRoutingRule({
          id: routingRule.id
        });

        const updated = await getRoutingDataForPage(firstPage);
        expect(updated.routingRuleSet.routingRules).toHaveLength(1);
      });
    });

    describe("routing conditions", () => {
      let input;

      const newCondition = input =>
        createNewRoutingCondition(input).then(
          res => res.data.createRoutingCondition
        );

      beforeEach(async () => {
        const routingRuleSet = await createNewRoutingRuleSet(firstPage.id).then(
          res => res.data.createRoutingRuleSet
        );
        input = {
          comparator: "Equal",
          questionPageId: firstPage.id,
          routingRuleId: get(routingRuleSet, "routingRules[0].id")
        };
      });

      it("should create a routing condition for question page", async () => {
        const newRoutingCondition = await newCondition(input);
        expect(newRoutingCondition).toMatchObject({
          questionPage: {
            id: firstPage.id
          }
        });
      });

      it("should set question page to null when page deleted", async () => {
        /*
          Given two pages A and B
          And B has a routing condition that refers to A
          When A is deleted
          Then B's routing condition page should be null
         */
        const pageA = firstPage;
        const pageB = await createQuestionPage(first(sections).id).then(
          res => res.data.createQuestionPage
        );

        await createNewRoutingRuleSet(pageB.id);
        const routingInfo = await getFullRoutingTree(pageB);
        const routingCondition = get(
          routingInfo,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
        );
        await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: pageA.id
        });

        await deleteQuestionPage(pageA);

        const updatedRoutingInfo = await getFullRoutingTree(pageB);
        const updatedRoutingCondition = get(
          updatedRoutingInfo,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
        );

        expect(updatedRoutingCondition).toMatchObject({
          questionPage: null,
          answer: null
        });
      });

      it("should set condition answer to null when answer is deleted", async () => {
        /*
          Given two pages A and B
          And B has a routing condition that refers to an answer on page A
          When the answer from page A is deleted
          Then B's routing condition answer should be null
         */
        const pageA = firstPage;
        const answer = await createNewAnswer(pageA, "Checkbox");

        const pageB = await createQuestionPage(first(sections).id).then(
          res => res.data.createQuestionPage
        );

        await createNewRoutingRuleSet(pageB.id);
        const routingInfo = await getFullRoutingTree(pageB);
        const routingCondition = get(
          routingInfo,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
        );
        await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: pageA.id,
          answerId: answer.id
        });

        await deleteAnswer(answer);

        const updatedRoutingInfo = await getFullRoutingTree(pageB);
        const updatedRoutingCondition = get(
          updatedRoutingInfo,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
        );

        expect(updatedRoutingCondition).toMatchObject({
          questionPage: null,
          answer: null
        });
      });

      it("should remove routing condition values when option is deleted", async () => {
        /*
          Given a page with a routing condition that points to a checkbox answer
          And one of the options is toggled on at the routing condition
          When the option is deleted
          Then the routing condition value for the deleted option should also be deleted
         */
        const answer = await createNewAnswer(firstPage, "Radio");
        await createNewRoutingRuleSet(firstPage.id);

        const options = get(answer, "options");

        const routingInfo = await getFullRoutingTree(firstPage);
        const routingCondition = get(
          routingInfo,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0]"
        );

        await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: firstPage.id,
          answerId: answer.id
        });

        await toggleConditionOptionMutation(
          routingCondition.id,
          true,
          options[0].id
        );

        const beforeDeletion = await getFullRoutingTree(firstPage);
        let conditionValues = get(
          beforeDeletion,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value[0]"
        );
        expect(conditionValues).toEqual(options[0].id);

        await deleteOption(options[0]);

        const afterDeletion = await getFullRoutingTree(firstPage);
        conditionValues = get(
          afterDeletion,
          "data.questionPage.routingRuleSet.routingRules[0].conditions[0].routingValue.value"
        );
        expect(conditionValues).toHaveLength(0);
      });

      it("should delete a routing condition for question page", async () => {
        const newRoutingCondition = await newCondition(input);
        const page = await getRoutingDataForPage(firstPage);
        expect(
          get(page, "routingRuleSet.routingRules[0].conditions")
        ).toHaveLength(2);

        await deleteRoutingConditionMutation({ id: newRoutingCondition.id });

        const updated = await getRoutingDataForPage(firstPage);
        expect(
          get(updated, "routingRuleSet.routingRules[0].conditions")
        ).toHaveLength(1);
      });

      it("should set condition to first answer in page if one exists", async () => {
        const answer = await createNewAnswer(firstPage, "Checkbox");
        const routingCondition = await newCondition(input);

        expect(routingCondition).toMatchObject({
          answer: {
            id: answer.id
          }
        });
      });

      it("should always use first answer on page when creating a condition", async () => {
        const answer1 = await createNewAnswer(firstPage, "Number");
        await createNewAnswer(firstPage, "Checkbox");
        const routingCondition = await newCondition(input);

        expect(routingCondition).toMatchObject({
          answer: {
            id: answer1.id
          }
        });
      });

      it("should be possible to change the page for the condition", async () => {
        const section = first(sections);
        const page = await getRoutingDataForPage(firstPage);

        const routingCondition = get(
          page,
          "routingRuleSet.routingRules[0].conditions[0]"
        );
        expect(routingCondition).toMatchObject({
          questionPage: {
            id: firstPage.id
          }
        });

        const newPage = await addPage(section.id);

        await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: newPage.id
        });

        const updated = await getRoutingDataForPage(firstPage);
        expect(
          get(updated, "routingRuleSet.routingRules[0].conditions[0]")
        ).toMatchObject({
          questionPage: {
            id: newPage.id
          }
        });
      });

      it("should error if trying to update a condition with an invalid question/answer combo", async () => {
        // Given page A with answer I
        // And page B with answer J
        // When I update a routing condition with question A answer J
        // Then I should get an error

        const section = first(sections);
        const pageA = firstPage;
        const pageB = await addPage(section.id);

        const answerI = await createNewAnswer(pageA, "Checkbox");
        const answerJ = await createNewAnswer(pageB, "Checkbox");

        const routingInfo = await getRoutingDataForPage(pageA);
        const routingCondition = get(
          routingInfo,
          "routingRuleSet.routingRules[0].conditions[0]"
        );

        const res1 = await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: pageA.id,
          answerId: answerJ.id
        });

        expect(res1.errors).toHaveLength(1);

        const res2 = await changeRoutingConditionMutation({
          id: routingCondition.id,
          questionPageId: pageB.id,
          answerId: answerI.id
        });

        expect(res2.errors).toHaveLength(1);
      });
    });
  });
});

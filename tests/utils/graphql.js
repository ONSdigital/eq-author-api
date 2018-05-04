const createQuestionnaireMutation = `mutation CreateQuestionnaire($input: CreateQuestionnaireInput!) {
    createQuestionnaire(input: $input) {
      id
      title
      description
      navigation
      legalBasis
      theme
      sections {
        id
        pages {
          id
        }
      }
    }
  }
`;

const createAnswerMutation = `
  mutation CreateAnswer($input: CreateAnswerInput!) {
    createAnswer(input: $input) {
      id,
      description,
      guidance,
      qCode,
      label,
      type,
      mandatory
      ... on MultipleChoiceAnswer {
        options {
          id
        },
        other {
          answer {
            id
            type
          },
          option {
            id
          }
        }
      }
    }
  }
`;

const createOtherMutation = `
  mutation CreateOther($input: CreateOtherInput!) {
    createOther(input: $input) {
      option {
        id
      }
      answer {
        id
        type
        description
      }
    }
  }
`;

const deleteOtherMutation = `
  mutation DeleteOther($input: DeleteOtherInput!) {
    deleteOther(input: $input) {
      option {
        id
      }
      answer {
        id
        type
        description
      }
    }
  }
`;

const getAnswerQuery = `
  query GetAnswer($id: ID!) {
    answer(id: $id) {
      id
      description
      guidance
      qCode
      label
      type
      mandatory
      ... on MultipleChoiceAnswer {
        options {
          id
        },
        other {
          answer {
            id
            type
            description
          }
          option {
            id
          }
        }
      }
    }
  }
`;

const getAnswersQuery = `
  query GetAnswers($id: ID!) {
    page(id: $id) {
      ... on QuestionPage {
        answers {
          id
          type
        }
      }
    }
  }
`;

const getBasicRoutingQuery = `
query GetPage($id: ID!){
  page(id: $id){
    ...on QuestionPage{
      id
      routingRuleSet{
        id
        routingRules{
          id
          conditions{
            id
            routingValue{
              ...on IDArrayValue{
                value
              }
            }
          }
        }
      }
    }
  }
}
`;

const createRoutingRuleSetMutation = `
  mutation CreateRoutingRuleSet($input: CreateRoutingRuleSetInput!){
    createRoutingRuleSet(input: $input)
    {
      id
      questionPage{
        id
      }
      routingRules{
        id
      }  
    }
  }
`;

const createRoutingRule = `
  mutation($input: CreateRoutingRuleInput!){
    createRoutingRule (input: $input)
    {
      id
      operation
      goto {
        page{
          id
        }
      }
    }
  }
`;

const createRoutingCondition = `
  mutation($input: CreateRoutingConditionInput!){
    createRoutingCondition (input: $input)
    {
      id
      comparator
      answer{
        id
      }
    }
  }
`;

const toggleConditionOption = `
  mutation($input: ToggleConditionOptionInput!) {
    toggleConditionOption (input: $input)
    {
      ...on IDArrayValue{
        value
      }
    }
  }
`;

const getEntireRoutingStructure = `
query QuestionPage($id: ID!) {
  questionPage(id: $id) {
    routingRuleSet {
      id
      questionPage {
        id
      }
      else {
        page {
          id
        }
      }
      routingRules{
        id
        operation
        goto{
          page{
            id
          }
        }
        conditions{
          id
          comparator
          answer{
            id
          }
          routingValue{
            ...on IDArrayValue{
              value
            }
          }
        }
      }
    }
  }
}
`;

module.exports = {
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
};

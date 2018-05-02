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

module.exports = {
  createQuestionnaireMutation,
  createAnswerMutation,
  createOtherMutation,
  deleteOtherMutation,
  getAnswerQuery,
  getAnswersQuery
};

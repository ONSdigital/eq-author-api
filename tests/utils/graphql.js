const createQuestionnaire = `mutation CreateQuestionnaire($input: CreateQuestionnaireInput!) {
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

const createAnswer = `
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
        otherAnswer {
          id
          type
        }
      }
    }
  }
`;

const createOtherAnswer = `
  mutation CreateOtherAnswer($input: CreateOtherAnswerInput!) {
    createOtherAnswer(input: $input) {
      id
      type
    }
  }
`;

const deleteOtherAnswer = `
  mutation DeleteOtherAnswer($input: DeleteOtherAnswerInput!) {
    deleteOtherAnswer(input: $input) {
      id
      type
    }
  }
`;

const getAnswer = `
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
        otherAnswer {
          id
          type
        }
      }
    }
  }
`;

const getAnswers = `
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
  createQuestionnaire,
  createAnswer,
  createOtherAnswer,
  deleteOtherAnswer,
  getAnswer,
  getAnswers
};

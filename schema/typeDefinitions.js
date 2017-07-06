module.exports = `type Questionnaire {
    id: Int
    title: String
    description: String
    theme: String
    legalBasis: LegalBasis
    navigation: Boolean
    surveyId: String
    groups: [Group]
}

type Group {
    id: Int
    title: String!
    description: String
    pages: [Page]
    questionnaireId: Int!
}

interface Page {
    id: Int!
    title: String!
    description: String
    pageType: PageType!
    groupId: Int!
}

type QuestionPage implements Page {
    id: Int!
    title: String!
    description: String!
    guidance: String
    pageType: PageType!
    type: QuestionType!
    mandatory: Boolean
    answers:  [Answer]
    groupId: Int!
}

type Answer {
    id: Int
    description: String
    guidance: String
    qCode: String
    label: String
    type: AnswerType
    mandatory: Boolean
    questionPageId: Int
}

enum PageType {
  QuestionPage
  InterstitialPage
}

enum QuestionType {
    General
    DateRange
    RepeatingAnswer
    Relationship
}

enum AnswerType {
    Checkbox
    Currency
    Date
    MonthYearDate
    Integer
    Percentage
    PositiveInteger
    Radio
    TextArea
    TextField
    Relationship
}

enum LegalBasis {
    Voluntary
    StatisticsOfTradeAct
}

type Query {
    questionnaires: [Questionnaire]
    questionnaire(id: Int!): Questionnaire
    group(id: Int!): Group
    page(id: Int!): Page
    questionPage(id: Int!): QuestionPage
    answer(id: Int!): Answer
}

type Mutation {
    createQuestionnaire(title: String!, description: String, theme: String!, legalBasis: LegalBasis!, navigation: Boolean, surveyId: String!) : Questionnaire
    updateQuestionnaire(id: Int!, title: String, description: String, theme: String, legalBasis: LegalBasis, navigation: Boolean, surveyId: String) : Questionnaire
    deleteQuestionnaire(id: Int!) : Questionnaire

    createGroup(title: String!, description: String, questionnaireId: Int!) : Group
    updateGroup(id: Int!, title: String, description: String) : Group
    deleteGroup(id: Int!) : Group

    createPage(title: String!, description: String, groupId: Int!) : Page
    updatePage(id: Int!, title: String!, description: String) : Page
    deletePage(id: Int!) : Page

    createQuestionPage(title: String!, description: String, guidance: String, type: QuestionType!, mandatory: Boolean, groupId: Int!) : QuestionPage
    updateQuestionPage(id: Int!, title: String, description: String, guidance: String, type: QuestionType, mandatory: Boolean) : QuestionPage
    deleteQuestionPage(id: Int!) : QuestionPage

    createAnswer(description: String, guidance: String, label: String, qCode: String, type: AnswerType!, mandatory: Boolean!, questionPageId: Int!) : Answer
    updateAnswer(id: Int!, description: String, guidance: String, label: String, qCode: String, type: AnswerType, mandatory: Boolean) : Answer
    deleteAnswer(id: Int!) : Answer
}
`;
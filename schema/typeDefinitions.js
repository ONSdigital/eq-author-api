module.exports = `type Questionnaire {
    id: Int
    title: String
    description: String
    theme: String
    legalBasis: LegalBasis
    navigation: Boolean
    surveyId: String
    sections: [Section]
    groups: [Section] @deprecated(reason: "use 'sections' instead")
}

type Section {
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
    sectionId: Int!
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
    sectionId: Int!
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
    section(id: Int!): Section
    page(id: Int!): Page
    questionPage(id: Int!): QuestionPage
    answer(id: Int!): Answer
}

type Mutation {
    createQuestionnaire(title: String!, description: String, theme: String!, legalBasis: LegalBasis!, navigation: Boolean, surveyId: String!) : Questionnaire
    updateQuestionnaire(id: Int!, title: String, description: String, theme: String, legalBasis: LegalBasis, navigation: Boolean, surveyId: String) : Questionnaire
    deleteQuestionnaire(id: Int!) : Questionnaire

    createSection(title: String!, description: String, questionnaireId: Int!) : Section
    updateSection(id: Int!, title: String, description: String) : Section
    deleteSection(id: Int!) : Section

    createPage(title: String!, description: String, sectionId: Int!) : Page
    updatePage(id: Int!, title: String!, description: String) : Page
    deletePage(id: Int!) : Page

    createQuestionPage(title: String!, description: String, guidance: String, type: QuestionType!, mandatory: Boolean, sectionId: Int!) : QuestionPage
    updateQuestionPage(id: Int!, title: String, description: String, guidance: String, type: QuestionType, mandatory: Boolean) : QuestionPage
    deleteQuestionPage(id: Int!) : QuestionPage

    createAnswer(description: String, guidance: String, label: String, qCode: String, type: AnswerType!, mandatory: Boolean!, questionPageId: Int!) : Answer
    updateAnswer(id: Int!, description: String, guidance: String, label: String, qCode: String, type: AnswerType, mandatory: Boolean) : Answer
    deleteAnswer(id: Int!) : Answer
}
`;

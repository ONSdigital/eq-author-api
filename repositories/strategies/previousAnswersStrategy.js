const db = require("../../db");

module.exports.getPreviousAnswers = ({
  answerTypes,
  sectionPosition,
  pagePosition,
  questionnaireId
}) =>
  db("Answers")
    .select("Answers.*")
    .join("PagesView", "Answers.questionPageId", "PagesView.id")
    .join("SectionsView", "PagesView.sectionId", "SectionsView.id")
    .whereIn("Answers.type", answerTypes)
    .andWhere("Answers.isDeleted", false)
    .andWhere({ questionnaireId })
    .andWhere(query =>
      query
        .where("SectionsView.position", "<", sectionPosition)
        .orWhere(query =>
          query
            .where("SectionsView.position", sectionPosition)
            .andWhere("PagesView.position", "<", pagePosition)
        )
    );

const { head, isNil } = require("lodash/fp");

const createOtherAnswer = async (trx, { id }) => {
  const existingOtherAnswer = await trx("Answers")
    .where({ parentAnswerId: id })
    .first();

  if (!isNil(existingOtherAnswer)) {
    throw new Error(
      "Cannot add a second 'other' Answer. Delete the existing one first."
    );
  }

  return trx("Answers")
    .insert({
      mandatory: false,
      type: "TextField",
      parentAnswerId: id
    })
    .returning("*")
    .then(head);
};

const deleteOtherAnswer = async (trx, { id }) => {
  const existingOtherAnswer = await trx("Answers")
    .where({ parentAnswerId: id })
    .first();

  if (isNil(existingOtherAnswer)) {
    throw new Error(`Answer with id ${id} does not have an "other" answer.`);
  }

  return trx("Answers")
    .where("id", existingOtherAnswer.id)
    .update({
      isDeleted: true,
      parentAnswerId: null
    })
    .returning("*");
};

module.exports = {
  createOtherAnswer,
  deleteOtherAnswer
};

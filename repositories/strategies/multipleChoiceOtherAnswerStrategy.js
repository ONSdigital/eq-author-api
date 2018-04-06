const { head, isNil } = require("lodash/fp");

const findOtherAnswer = async (trx, parentAnswerId) =>
  trx("Answers")
    .where({ parentAnswerId, isDeleted: false })
    .first();

const createAnswer = async (trx, parentAnswerId, type) =>
  trx("Answers")
    .insert({
      mandatory: false,
      type,
      parentAnswerId
    })
    .returning("*")
    .then(head);

const deleteAnswer = async (trx, { id }) =>
  trx("Answers")
    .where("id", id)
    .update({
      isDeleted: true
    })
    .returning("*")
    .then(head);

const createOption = async (trx, { id, parentAnswerId }) =>
  trx("Options")
    .insert({
      AnswerId: parentAnswerId,
      otherAnswerId: id
    })
    .returning("*")
    .then(head);

const deleteOption = async (trx, { id }) =>
  trx("Options")
    .where("otherAnswerId", id)
    .update({
      isDeleted: true
    })
    .returning("*");

const createOtherAnswer = async (trx, { id }) => {
  const existingOtherAnswer = await findOtherAnswer(trx, id);

  if (!isNil(existingOtherAnswer)) {
    throw new Error(
      "Cannot add a second 'other' Answer. Delete the existing one first."
    );
  }

  const otherAnswer = await createAnswer(trx, id, "TextField");
  await createOption(trx, otherAnswer);
  return otherAnswer;
};

const deleteOtherAnswer = async (trx, { id }) => {
  const otherAnswer = await findOtherAnswer(trx, id);

  if (isNil(otherAnswer)) {
    throw new Error(`Answer with id ${id} does not have an "other" answer.`);
  }

  await deleteOption(trx, otherAnswer);
  return deleteAnswer(trx, otherAnswer);
};

module.exports = {
  createOtherAnswer,
  deleteOtherAnswer
};

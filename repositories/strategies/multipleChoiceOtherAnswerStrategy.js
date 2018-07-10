const { head, isNil } = require("lodash/fp");

const findOtherAnswer = async (trx, parentAnswerId) =>
  trx("Answers")
    .where({ parentAnswerId, isDeleted: false })
    .first();

const createAnswer = async (trx, parentAnswerId, type) =>
  trx("Answers")
    .insert({
      properties: { required: true },
      description: "",
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
    .returning("*")
    .then(head);

const createOtherAnswer = async (trx, { id }) => {
  const existingOtherAnswer = await findOtherAnswer(trx, id);

  if (!isNil(existingOtherAnswer)) {
    throw new Error(
      "Cannot add a second 'other' Answer. Delete the existing one first."
    );
  }

  const answer = await createAnswer(trx, id, "TextField");
  const option = await createOption(trx, answer);
  return {
    option,
    answer
  };
};

const deleteOtherAnswer = async (trx, { id }) => {
  const otherAnswer = await findOtherAnswer(trx, id);

  if (isNil(otherAnswer)) {
    throw new Error(`Answer with id ${id} does not have an "other" answer.`);
  }

  const option = await deleteOption(trx, otherAnswer);
  const answer = await deleteAnswer(trx, otherAnswer);
  return {
    option,
    answer
  };
};

module.exports = {
  createOtherAnswer,
  deleteOtherAnswer
};

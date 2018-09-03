const Validation = require("../db/Validation");
const { head, flow, keys, remove, first } = require("lodash/fp");

const toggleValidationRule = ({ id, enabled }) => {
  return Validation.update(id, { enabled }).then(head);
};

const findByAnswerIdAndValidationType = ({ id }, validationType) => {
  return Validation.find({ answerId: id, validationType });
};

const getInputType = flow(
  keys,
  remove(key => key === "id"),
  first
);

const updateValidationRule = input => {
  const { custom, inclusive } = input[getInputType(input)];
  return Validation.update(input.id, { custom, config: { inclusive } }).then(
    head
  );
};

Object.assign(module.exports, {
  toggleValidationRule,
  findByAnswerIdAndValidationType,
  updateValidationRule
});

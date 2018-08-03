const Validation = require("../db/Validation");
const { head } = require("lodash/fp");

const toggleValidationRule = ({ id, enabled }) => {
  return Validation.update(id, { enabled }).then(head);
};

const findByTypeId = ({ id }, validationType) => {
  return Validation.find({ AnswerId: id, validationType });
};

const updateValidationRule = input => {
  const { inclusive, custom } = input.minValueInput;
  return Validation.update(input.id, { custom, config: { inclusive } }).then(
    head
  );
};

Object.assign(module.exports, {
  toggleValidationRule,
  findByTypeId,
  updateValidationRule
});

const {
  answerTypeMap,
  validationRuleMap,
  defaultValidationRuleConfigs
} = require("../../utils/defaultAnswerValidations");
const db = require("../../db");

const { findKey, includes } = require("lodash");

const getValidationEntity = type =>
  findKey(answerTypeMap, field => includes(field, type));

const createDefaultValidationsForAnswer = async ({ id, type }, trx = db) => {
  const validationEntity = getValidationEntity(type);

  const validationTypes = validationRuleMap[validationEntity];

  const promises = validationTypes.map(validationType => {
    return trx("Validation_AnswerRules").insert({
      answerId: id,
      validationType,
      config: defaultValidationRuleConfigs[validationType]
    });
  });
  await Promise.all(promises);
};

Object.assign(module.exports, {
  createDefaultValidationsForAnswer,
  getValidationEntity
});

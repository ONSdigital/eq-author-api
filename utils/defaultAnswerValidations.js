const answerTypeMap = {
  number: ["Currency", "Number"]
};

const validationRuleMap = {
  number: ["minValue", "maxValue"]
};

const defaultValidationRuleConfigs = {
  minValue: {
    inclusive: false
  },
  maxValue: {
    inclusive: false
  }
};

Object.assign(module.exports, {
  answerTypeMap,
  validationRuleMap,
  defaultValidationRuleConfigs
});

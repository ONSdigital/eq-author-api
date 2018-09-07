const answerTypeMap = {
  number: ["Currency", "Number"],
  date: ["Date"]
};

const validationRuleMap = {
  number: ["minValue", "maxValue"],
  date: ["earliestDate"]
};

const defaultValidationRuleConfigs = {
  minValue: {
    inclusive: false
  },
  maxValue: {
    inclusive: false
  },
  earliestDate: {
    inclusive: false,
    offset: {
      value: 0,
      unit: "Days"
    },
    relativePostion: "Before"
  }
};

Object.assign(module.exports, {
  answerTypeMap,
  validationRuleMap,
  defaultValidationRuleConfigs
});

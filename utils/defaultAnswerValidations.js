const answerTypeMap = {
  number: ["Currency", "Number"],
  date: ["Date"]
};

const validationRuleMap = {
  number: ["minValue", "maxValue"],
  date: ["earliestDate", "latestDate"]
};

const defaultValidationRuleConfigs = {
  minValue: {
    inclusive: false
  },
  maxValue: {
    inclusive: false
  },
  earliestDate: {
    offset: {
      value: 0,
      unit: "Days"
    },
    relativePosition: "Before"
  },
  latestDate: {
    offset: {
      value: 0,
      unit: "Days"
    },
    relativePosition: "Before"
  }
};

Object.assign(module.exports, {
  answerTypeMap,
  validationRuleMap,
  defaultValidationRuleConfigs
});

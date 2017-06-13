module.exports = function createAnswerModel(sequelize, DataTypes) {

  const Answer = sequelize.define("Answer", {

    description : {
      type : DataTypes.STRING
    },

    guidance : {
      type : DataTypes.STRING
    },

    qCode : {
      type : DataTypes.STRING
    },

    label : {
      type: DataTypes.STRING
    },

    type : {
      type : DataTypes.ENUM(
        "Checkbox",
        "Currency",
        "Date",
        "MonthYearDate",
        "Integer",
        "Percentage",
        "PositiveInteger",
        "Radio",
        "TextArea",
        "TextField",
        "Relationship"
      ),
      allowNull : false
    },

    mandatory : {
      type : DataTypes.BOOLEAN,
      defaultValue : false,
      allowNull: false
    }

  }, {

    classMethods : {
      associate(models) {
        Answer.Question = Answer.belongsTo(models.Question);
      }
    }

  });

  return Answer;
};


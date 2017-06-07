module.exports = function createAnswerModel(sequelize, DataTypes) {

  const Answer = sequelize.define("Answer", {

    title : {
      type : DataTypes.STRING,
      allowNull: false
    },

    description : {
      type : DataTypes.STRING
    },

    guidance : {
      type : DataTypes.STRING
    },

    qCode : {
      type : DataTypes.STRING
    },

    guidance : {
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
      defaultValue : false
    }

  }, {

    classMethods : {
      associate(models) {
        Answer.belongsTo(models.Question);
      }
    }

  });

  return Answer;
};


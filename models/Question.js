module.exports = function createQuestionModel(sequelize, DataTypes) {

  const Question = sequelize.define("Question", {

    title : {
      type : DataTypes.STRING,
      allowNull: false
    },

    description : {
      type : DataTypes.STRING
    },

    guidance : {
      type: DataTypes.STRING
    },

    type : {
      type : DataTypes.ENUM(
        "General",
        "DateRange",
        "RepeatingAnswer",
        "Relationship"
      )
    },

    mandatory : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    }

  }, {

    classMethods : {
      associate(models) {
        Question.belongsTo(models.Page);
        Question.hasMany(models.Answer);
      }
    }

  });

  return Question;
};


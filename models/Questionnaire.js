module.exports = function createQuestionnaireModel(sequelize, DataTypes) {

  const Questionnare = sequelize.define("Questionnaire", {

    title : {
      type : DataTypes.STRING,
      allowNull: false
    },

    description : {
      type : DataTypes.STRING
    },

    theme : {
      type: DataTypes.STRING,
      allowNull: false
    },

    legalBasis : {
      type: DataTypes.ENUM(
        "Voluntary",
        "StatisticsOfTradeAct"
      ),
      allowNull: false
    },

    navigation : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },

    surveyId : {
      type : DataTypes.STRING,
      allowNull: false
    }

  }, {

    classMethods : {
      associate(models) {
        Questionnare.Pages = Questionnare.hasMany(models.Page);
      }
    }

  });

  return Questionnare;
};

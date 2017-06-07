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
      type: DataTypes.STRING
    },

    legalBasis : {
      type: DataTypes.ENUM(
        "Voluntary",
        "StatisticsOfTradeAct"
      )
    },

    navigation : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    }

  }, {

    classMethods : {
      associate(models) {
        Questionnare.hasMany(models.Page);
      }
    }

  });

  return Questionnare;
};

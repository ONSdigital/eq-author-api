module.exports = function createPageModel(sequelize, DataTypes) {

  const Page = sequelize.define("Page", {

    title : {
      type : DataTypes.STRING,
      allowNull : false
    },

    description : {
      type : DataTypes.STRING
    }

  }, {

    classMethods : {
      associate(models) {
        Page.belongsTo(models.Questionnaire);
        Page.hasMany(models.Question);
      }
    }

  });

  return Page;
};
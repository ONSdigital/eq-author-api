module.exports = function createMessageModel(sequelize, DataTypes) {
  return sequelize.define("message", {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
};
var Sequelize = require('sequelize');
var {
  DATABASE,
  USERNAME,
  PASSWORD,
  HOST,
  DIALECT
} = require('./settings').db

// Define the connection to the database.
var conn = new Sequelize(
  DATABASE,
  USERNAME,
  PASSWORD,
  {
    host: HOST,
    dialect: DIALECT
  }
);

var Message = conn.define('message', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

conn.sync({force: true}).then(()=>{
  Message.create({
    text: 'World'
  })
})

module.exports = conn;

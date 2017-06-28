const Sequelize = require('sequelize');
const {
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_DIALECT
} = require('./settings').db

// Define the connection to the database.
const conn = new Sequelize(
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOSTNAME,
    dialect: DB_DIALECT
  }
);

const Message = conn.define('message', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

conn.sync().then(()=>{
  Message.create({
    text: 'World'
  })
})

module.exports = conn;

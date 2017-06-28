module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.DB_CONNECTION_URI
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    }
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DB_CONNECTION_URI,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DB_CONNECTION_URI,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

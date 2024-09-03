module.exports = {
  development: {
    username: 'test',
    password: 'test',
    database: 'quiz',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: 'test',
    password: 'test',
    database: 'quiz_test',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: 'test',
    password: 'test',
    database: 'quiz_prod',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
};

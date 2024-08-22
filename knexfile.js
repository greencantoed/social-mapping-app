module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'walras',
      database: 'social_mapping',
    },
    migrations: {
      directory: './migrations',
    },
    useNullAsDefault: true,
  },
};

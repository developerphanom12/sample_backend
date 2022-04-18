// TODO: delete this file. Temporary solution before refactoring!
require('dotenv-flow').config();

const ENV = process.env.NODE_ENV || 'local';

export const config = () => ({
  database: {
    type: "postgres" as "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ['dist/**/*.entity.js'],
    subscribers: ['dist/**/*.subscriber.js'],
    migrationsTableName: 'migration',
    migrations: ['dist/migration/*.js'],
    cli: {
      migrationsDir: 'src/migration',
    },
    seeds: ['src/seeds/**/*.seed.js'],
    factories: ['src/factories/**/*.factory.js'],
  },
});
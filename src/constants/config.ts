// TODO: delete this file. Temporary solution before refactoring!
require('dotenv-flow').config();

const ENV = process.env.NODE_ENV || 'development';

const ENV_HASH_MAP = {
  api_url: {
    local: 'http://localhost:3000/',
    development: 'http://3.9.95.221/',
  },
};

export const config = () => ({
  port: Number(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET,
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
  urls: {
    apiUrl: ENV_HASH_MAP.api_url[ENV],
  },
  transport: {
    companyName: 'Receipt Hub',
    email: process.env.TRANSPORTER_EMAIL,
  },
  aws: {
    key: process.env.AWS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
  },
});
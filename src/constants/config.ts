import 'dotenv/config';

const ENV = process.env.NODE_ENV || 'dev';

const ENV_HASH_MAP = {
  db_host: {
    dev: process.env.DEV_DB_HOST,
    stage: process.env.STAGE_DB_HOST,
    prod: process.env.DB_HOST,
  },
  user_name: {
    dev: process.env.DEV_DB_USERNAME,
    stage: process.env.STAGE_DB_USERNAME,
    prod: process.env.DB_USERNAME,
  },
  password: {
    dev: process.env.DEV_DB_PASSWORD,
    stage: process.env.STAGE_DB_PASSWORD,
    prod: process.env.DB_PASSWORD,
  },
  database: {
    dev: process.env.DEV_DB_DATABASE,
    stage: process.env.STAGE_DB_DATABASE,
    prod: process.env.DB_DATABASE,
  },
  api_url: {
    dev: 'http://localhost:3000/',
    //stage: 'https://stageapi.declare.io/',
    //prod: 'https://api.declare.io/',
  },
  hubspot_api_key: {
    dev: '',
    stage: '',
    prod: process.env.HUB_SPOT_API_KEY,
  },
};

export const config = () => ({
  port: Number(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET,
  database: {
    type: 'postgres',
    host: ENV_HASH_MAP.db_host[ENV],
    port: 5432,
    username: ENV_HASH_MAP.user_name[ENV],
    password: ENV_HASH_MAP.password[ENV],
    database: ENV_HASH_MAP.database[ENV],
    synchronize: true,
    // dropSchema: true,
    logging: false,
    entities: ['dist/**/*.entity.js'],
    subscribers: ['dist/**/*.subscriber.js'],
    migrationsTableName: 'migration',
    migrations: ['dist/migration/*.js'],
    cli: {
      migrationsDir: 'src/migration',
    },
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
    bucket: process.env.AWS_S3_BUCKET_NAME,
  },
});

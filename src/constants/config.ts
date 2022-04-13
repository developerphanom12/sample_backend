// TODO: delete this file. Temporary solution before refactoring!
require('dotenv-flow').config();

const ENV = process.env.NODE_ENV || 'dev';

const ENV_HASH_MAP = {
  api_url: {
    dev: 'http://localhost:3000/',
    //stage: 'https://stageapi.declare.io/',
    //prod: 'https://api.declare.io/',
  },
};

export const config = () => ({
  urls: {
    apiUrl: ENV_HASH_MAP.api_url[ENV],
  },
});

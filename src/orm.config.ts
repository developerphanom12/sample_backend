import { config } from './constants/config';

const { database } = config();

module.exports = {
  ...database,
};

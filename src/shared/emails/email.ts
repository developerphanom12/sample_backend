import * as ses from 'node-ses';

export const sesClient = ses.createClient({
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  amazon: 'https://email.eu-west-2.amazonaws.com'
});

import dotevn from 'dotenv';
import assert from 'assert';

dotevn.config();

function getEnvValue(key: string) {
  const val = process.env[key];
  assert(val, `Please set ${key} in environment`);
  return val;
}

interface Config {
  environment: 'dev' | 'prod';
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  firebaseProjectId: string;
  selfUrl: string;
  selfPingSecret: string;
  selfPingInterval: number;
}

export const config: Config = {
  environment: getEnvValue('ENVIRONMENT') === 'prod' ? 'prod' : 'dev',
  firebaseClientEmail: getEnvValue('FIREBASE_CLIENT_EMAIL'),
  firebasePrivateKey: getEnvValue('FIREBASE_PRIVATE_KEY'),
  firebaseProjectId: getEnvValue('FIREBASE_PROJECT_ID'),
  selfUrl: getEnvValue('SELF_URL'),
  selfPingSecret: getEnvValue('SELF_PING_SECRET'),
  selfPingInterval: parseInt(getEnvValue('SELF_PING_INTERVAL')),
};

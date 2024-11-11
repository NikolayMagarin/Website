import dotevn from 'dotenv';
import assert from 'assert';

dotevn.config();

function getEnvValue(key: string) {
  const val = process.env[key];
  assert(val, `Please set ${key} in environment`);
  return val;
}

export const config = {
  firebaseClientEmail: getEnvValue('FIREBASE_CLIENT_EMAIL'),
  firebasePrivateKey: getEnvValue('FIREBASE_PRIVATE_KEY'),
  firebaseProjectId: getEnvValue('FIREBASE_PROJECT_ID'),
};

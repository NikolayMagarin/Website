import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config';

initializeApp({
  credential: cert({
    clientEmail: config.firebaseClientEmail,
    privateKey: config.firebasePrivateKey,
    projectId: config.firebaseProjectId,
  }),
});

export const db = getFirestore();

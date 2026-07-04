/**
 * Initialisation de Firebase Admin SDK, adaptée pour Vercel.
 * Sur Vercel on ne peut pas déposer de fichier secret sur le serveur,
 * donc on stocke le JSON de la clé de service dans une variable
 * d'environnement (FIREBASE_SERVICE_ACCOUNT_JSON) et on le parse ici.
 */
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON manquante. Ajoutez-la dans les variables d'environnement Vercel."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;

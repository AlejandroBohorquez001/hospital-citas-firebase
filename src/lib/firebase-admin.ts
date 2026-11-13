import * as admin from 'firebase-admin';

let firestoreInstance: admin.firestore.Firestore | null = null;

export function getFirestoreDB(): admin.firestore.Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (admin.apps.length > 0) {
    firestoreInstance = admin.firestore();
    return firestoreInstance;
  }

  // Verificar variables de entorno de Firebase
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (serviceAccountJson) {
    try {
      const parsedKey = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsedKey),
      });
    } catch (e) {
      console.error('Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY contiene un formato JSON inválido.');
    }
  } else if (projectId && clientEmail && privateKey) {
    // Normalizar saltos de línea en la clave privada
    privateKey = privateKey.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Intenta usar credenciales por defecto (ADC o emulador si existe)
    try {
      admin.initializeApp({
        projectId: projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hospital-citas-demo',
      });
    } catch {
      console.warn('Firebase inicializado sin credenciales explícitas.');
    }
  }

  firestoreInstance = admin.firestore();
  return firestoreInstance;
}

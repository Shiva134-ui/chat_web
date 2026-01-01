import { firebaseConfig } from './config.js';

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const rtdb = firebase.database(); // Realtime Database
export const messaging = firebase.messaging();

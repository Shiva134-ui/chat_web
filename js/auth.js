import { auth, db } from './firebase-init.js';

export async function loginWithEmail(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        throw error;
    }
}

export async function signUpWithEmail(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update Profile
        await user.updateProfile({
            displayName: displayName || email.split('@')[0]
        });

        // Initialize User in Firestore
        await db.collection('users').doc(user.uid).set({
            name: user.displayName,
            email: user.email,
            photoURL: null, // Default
            uid: user.uid,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        throw error;
    }
}

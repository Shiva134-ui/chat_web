import { auth, db, rtdb } from './firebase-init.js';
import { state, setState } from './state.js';
import { showApp, showLogin } from './ui.js';
import { setupNotifications } from './notifications.js';
import { initChatListeners, loadContacts, cleanupChatListeners } from './chat.js';
import { setupDarkModeButton } from './ui.js';
import { generateAvatar } from './utils.js';
import './profile.js'; // Import to register event listeners

import { loginWithEmail, signUpWithEmail } from './auth.js';

// Global Event Listeners (Auth)
const googleLoginBtn = document.getElementById('googleLoginBtn');
const signOutBtn = document.getElementById('signOutBtn');

// Email Auth Elements
const emailLoginForm = document.getElementById('emailLoginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
const emailLoginBtn = document.getElementById('emailLoginBtn');

let isSignUpMode = false;

if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        if (isSignUpMode) {
            emailLoginBtn.textContent = 'Sign Up';
            toggleAuthModeBtn.textContent = 'Already have an account? Sign In';
            // Optional: Add Name field logic here if strictly needed, 
            // but we can default from email for MVP
        } else {
            emailLoginBtn.textContent = 'Sign In';
            toggleAuthModeBtn.textContent = "Don't have an account? Sign Up";
        }
    });
}

if (emailLoginForm) {
    emailLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;

        emailLoginBtn.disabled = true;
        emailLoginBtn.textContent = 'Processing...';

        try {
            if (isSignUpMode) {
                await signUpWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (error) {
            console.error("Auth Error:", error);
            alert(error.message);
        } finally {
            emailLoginBtn.disabled = false;
            emailLoginBtn.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';
        }
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            if (error.code === 'auth/popup-closed-by-user') {
                console.warn("User closed login popup.");
                return;
            }
            console.error("Login failed:", error);
            alert("Login failed: " + error.message);
        });
    });
}

if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut());

// Init Function
function init() {
    initChatListeners(); // Setup static listeners for chat

    auth.onAuthStateChanged(user => {
        if (user) {
            setState('currentlyLoggedInUser', user);

            // --- PRESENCE SYSTEM (RTDB) ---
            const userStatusDatabaseRef = rtdb.ref('/status/' + user.uid);
            const isOfflineForDatabase = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };
            const isOnlineForDatabase = {
                state: 'online',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };

            rtdb.ref('.info/connected').on('value', (snapshot) => {
                if (snapshot.val() === false) return;

                userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
                    userStatusDatabaseRef.set(isOnlineForDatabase);
                });
            });
            // ------------------------------

            // Sync user data to Firestore
            const userRef = db.collection('users').doc(user.uid);
            userRef.get().then(doc => {
                if (!doc.exists) {
                    userRef.set({
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        uid: user.uid,
                        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            });

            // Setup Notifications
            setupNotifications(user.uid);

            // Update UI with latest from Firestore
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const editProfileAvatar = document.getElementById('editProfileAvatar');



            // ... (other imports)

            // ...

            const setAvatarWithFallback = (element, url, name) => {
                if (!element) return;
                // If url exists, try it. If it fails (onerror), fallback to generated avatar using name.
                // If no url, use generated avatar immediately.
                if (url) {
                    element.src = url;
                    element.onerror = () => {
                        element.src = generateAvatar(name || 'User');
                        // Remove onerror to prevent infinite loop if generated avatar somehow fails (unlikely for data URI)
                        element.onerror = null;
                    };
                } else {
                    element.src = generateAvatar(name || 'User');
                }
            };

            userRef.onSnapshot(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const displayName = userData.name || user.displayName || 'User';

                    setAvatarWithFallback(userAvatar, userData.photoURL || user.photoURL, displayName);
                    if (userName) userName.textContent = displayName;
                    setAvatarWithFallback(editProfileAvatar, userData.photoURL || user.photoURL, displayName);
                }
            }, error => {
                console.error("Firestore listener error:", error);
            });

            setupDarkModeButton();
            showApp(user);
            loadContacts();
        } else {
            console.log("User signed out, cleaning up...");
            cleanupChatListeners();
            setState('currentlyLoggedInUser', null);
            showLogin();
        }
    });
}

init();

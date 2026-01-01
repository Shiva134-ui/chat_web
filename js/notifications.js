import { db, messaging } from './firebase-init.js';
import { VAPID_KEY } from './config.js';

export async function setupNotifications(uid) {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {

            // Explicitly register Service Worker
            try {
                // Path relative to index.html
                const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
                console.log('Service Worker registered with scope:', registration.scope);

                const token = await messaging.getToken({
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    // Save token to Firestore
                    db.collection('users').doc(uid).update({
                        fcmToken: token
                    }).catch(err => console.log("Error saving token", err));

                    console.log("FCM Token registered:", token);
                } else {
                    console.warn("No Instance ID token available. Request permission to generate one.");
                }

            } catch (swError) {
                console.error("FCM Error Details:", swError);

                if (window.location.protocol === 'file:') {
                    console.error("ERROR: Service Workers do not work on 'file://' URLs.\nYou must use 'http://localhost' (Local Server).");
                }
            }

        } else {
            alert("Notification permission denied. Please reset permissions in browser settings.");
        }
    } catch (error) {
        console.error("Notification setup failed:", error);
        alert("Error getting token: " + error.message);
    }

    // Handle Foreground Messages
    messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
        const noteTitle = payload.notification.title;
        const noteOptions = {
            body: payload.notification.body,
        };
        new Notification(noteTitle, noteOptions);
    });
}

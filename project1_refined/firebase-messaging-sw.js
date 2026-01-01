importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAK13NImvb_px80mstjAJHrP3qBAd8VC9E",
    authDomain: "project1-5fa5a.firebaseapp.com",
    databaseURL: "https://project1-5fa5a-default-rtdb.firebaseio.com",
    projectId: "project1-5fa5a",
    storageBucket: "project1-5fa5a.firebasestorage.app",
    messagingSenderId: "959153627928",
    appId: "1:959153627928:web:afdc248b8adfeebbb5f46d",
    measurementId: "G-CGQ4MSXVC9"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Optional: Handle background messages specifically if needed
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // You can add an icon here if you have one
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

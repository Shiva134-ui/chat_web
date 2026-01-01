import { auth, db, rtdb } from './firebase-init.js';
import { state } from './state.js';
import { generateAvatar } from './utils.js';

// Profile Modal Elements
const profileBtn = document.getElementById('userProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');

const profileNameInput = document.getElementById('editDisplayName');
const profileStatusInput = document.getElementById('editStatus');
const profileAvatarPreview = document.getElementById('editProfileAvatar');
const avatarUpload = document.getElementById('avatarInput');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

let selectedAvatarFile = null;

// Event Listeners
if (profileBtn) {
    profileBtn.addEventListener('click', openProfileModal);
}

if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', closeProfileModal);
}

if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) closeProfileModal();
    });
}

if (avatarUpload) {
    avatarUpload.addEventListener('change', handleAvatarSelect);
}

const saveProfileBtn = document.getElementById('saveProfileBtn');

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', handleProfileSave);
}

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', deleteAccount);
}

function openProfileModal() {
    if (!state.currentlyLoggedInUser) return;

    // Populate fields
    profileNameInput.value = state.currentlyLoggedInUser.displayName || ""; // Use displayName
    // We don't have a status field in auth, we'd need to fetch from Firestore users collection
    // For now assuming we have it in state or fetch it.
    // Ideally we fetch the user doc content.

    // Fetch user details from Firestore
    db.collection('users').doc(state.currentlyLoggedInUser.uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            profileNameInput.value = data.name || state.currentlyLoggedInUser.displayName || "";
            profileStatusInput.value = data.status || "Available";

            if (data.photoURL) {
                profileAvatarPreview.src = data.photoURL;
            } else {
                profileAvatarPreview.src = generateAvatar(data.name || "User");
            }
        }
    });

    profileModal.style.display = 'flex';
}

function closeProfileModal() {
    profileModal.style.display = 'none';
    selectedAvatarFile = null;
}

function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (file) {
        selectedAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            profileAvatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function handleProfileSave(e) {
    e.preventDefault();
    const newName = profileNameInput.value.trim();
    const newStatus = profileStatusInput.value.trim();
    const saveBtn = document.getElementById('saveProfileBtn');

    try {
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }

        let photoURL = state.currentlyLoggedInUser.photoURL;

        if (selectedAvatarFile) {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', selectedAvatarFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Ensure this is available globally or imported

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                photoURL = data.secure_url;
            }
        }

        // Update Auth Profile
        await state.currentlyLoggedInUser.updateProfile({
            displayName: newName,
            photoURL: photoURL
        });

        // Update Firestore User Doc
        await db.collection('users').doc(state.currentlyLoggedInUser.uid).update({
            name: newName,
            status: newStatus,
            photoURL: photoURL,
            searchName: newName.toLowerCase()
        });

        // Update RTDB Presence/Info (optional, mainly handled by triggers or local logic)

        closeProfileModal();
        alert("Profile updated!");

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    }
}

async function deleteAccount() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmDelete) return;

    try {
        const uid = state.currentlyLoggedInUser.uid;

        // 1. Delete from Realtime Database (Presence)
        await rtdb.ref('/status/' + uid).remove();
        await rtdb.ref('/typing').off(); // Clean up listeners logic if needed, but mainly remove data

        // 2. Delete from Firestore (Users collection)
        // Note: We might want to keep messages or delete them. For now just user profile.
        await db.collection('users').doc(uid).delete();

        // 3. Delete from Authentication
        await state.currentlyLoggedInUser.delete();

        alert("Account deleted.");
        location.reload(); // Refresh to show login screen

    } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. You may need to re-login recently.");
    }
}

import { state, setState } from './state.js';

export function showApp() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';

    // On mobile, show contact list by default
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('active');
    }
}

export function showLogin() {
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginOverlay').style.display = 'flex';
}

export function setupDarkModeButton() {
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (!darkModeBtn) return;

    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeBtn.innerHTML = '<span class="material-symbols-rounded">light_mode</span>';
    }

    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        darkModeBtn.innerHTML = isDark ?
            '<span class="material-symbols-rounded">light_mode</span>' :
            '<span class="material-symbols-rounded">dark_mode</span>';
    });
}

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');

if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

const mobileViewContactsBtn = document.getElementById('mobileViewContactsBtn');
if (mobileViewContactsBtn) {
    mobileViewContactsBtn.addEventListener('click', () => {
        if (sidebar) sidebar.classList.add('active');
    });
}

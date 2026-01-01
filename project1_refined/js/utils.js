import { state } from './state.js';

export function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

export function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateAvatar(name) {
    if (!name) return 'https://via.placeholder.com/150';

    // Remove (You) or other parenthesized text for initials
    const cleanName = name.replace(/\s*\(.*?\)\s*/g, '').trim();

    // Get initials (max 2 characters)
    const initials = cleanName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Create a canvas (simpler than SVG for handling many scenarios)
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // Background color (generate predictable color based on name)
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    ctx.fillStyle = `hsl(${hue}, 60%, 80%)`; // Pastel colors
    ctx.fillRect(0, 0, 100, 100);

    // Text settings
    ctx.fillStyle = '#1e293b'; // Slate 800
    ctx.font = 'bold 45px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    ctx.fillText(initials, 50, 52);

    return canvas.toDataURL('image/png');
}

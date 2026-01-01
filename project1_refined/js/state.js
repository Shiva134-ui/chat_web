export let state = {
    currentlyLoggedInUser: null,
    activeChatUserId: null,
    allContacts: [],
    messagesUnsubscribe: null,
    typingListenerRef: null,
    typingTimeout: null,
    isDarkMode: localStorage.getItem('darkMode') === 'true'
};

export function setState(key, value) {
    state[key] = value;
}

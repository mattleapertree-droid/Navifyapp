(function resetNavifyOnce() {
  const RESET_KEY = 'navify-reset-v1';
  if (localStorage.getItem(RESET_KEY) === 'done') return;

  const keysToClear = [
    'navify-user',
    'navify-name',
    'navify-contacts',
    'navify-live-contacts',
    'navify-favorites',
    'navify-phone',
    'navify-push',
    'navify-guide-target'
  ];

  keysToClear.forEach((key) => localStorage.removeItem(key));

  try {
    if (window.navifyAuth && typeof window.navifyAuth.signOut === 'function') {
      window.navifyAuth.signOut().catch(() => {});
    }
  } catch (_) {
    // Ignore sign-out errors on first load
  }

  localStorage.setItem(RESET_KEY, 'done');
})();

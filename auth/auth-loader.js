const authModalsHost = document.getElementById('authModals');

async function loadAuthPartials() {
  if (!authModalsHost) return;
  try {
    const [signInHtml, signUpHtml] = await Promise.all([
      fetch('auth/sign-in.html').then((r) => r.text()),
      fetch('auth/sign-up.html').then((r) => r.text())
    ]);
    authModalsHost.innerHTML = `${signInHtml}${signUpHtml}`;
    document.dispatchEvent(new CustomEvent('auth-modals-ready'));
  } catch (err) {
    console.warn('Auth modals failed to load', err);
  }
}

loadAuthPartials();

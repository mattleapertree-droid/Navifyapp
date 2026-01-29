function bindSignUp() {
  const signUpBtn = document.getElementById('signUpBtn');
  const signUpModal = document.getElementById('signUpModal');
  const createAccountBtn = document.getElementById('createAccountBtn');
  const usernameInput = signUpModal?.querySelector('input[type="text"]');
  const emailInput = signUpModal?.querySelector('input[type="email"]');
  const passwordInput = signUpModal?.querySelector('input[type="password"]');
  const termsConsent = document.getElementById('termsConsent');
  const authScreen = document.getElementById('authScreen');

  signUpBtn?.addEventListener('click', () => openModal(signUpModal));
  createAccountBtn?.addEventListener('click', async () => {
    if (!emailInput || !passwordInput) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = usernameInput?.value.trim() || '';
    if (!email || !password) {
      alert('Please enter an email and password to create your Navify account.');
      return;
    }
    if (!termsConsent?.checked) {
      alert('Please agree to the Navify Terms & Conditions, including camera and location consent.');
      return;
    }
    try {
      await navifyEmailSignUp(email, password, username);
      closeModal(signUpModal);
      authScreen?.setAttribute('hidden', 'true');
      alert('Account created. Check your email for a verification link, then continue to the app.');
      window.location.href = 'home.html';
    } catch (err) {
      console.error('Sign-up failed', err);
      alert('Sign-up failed. This email may already be in use or your Firebase config is not set.');
    }
  });
}

document.addEventListener('DOMContentLoaded', bindSignUp);

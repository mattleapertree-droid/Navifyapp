function bindSignIn() {
  const signInBtn = document.getElementById('signInBtn');
  const signInModal = document.getElementById('signInModal');
  const enterAppBtn = document.getElementById('enterAppBtn');
  const emailInput = signInModal?.querySelector('input[type="email"]');
  const passwordInput = signInModal?.querySelector('input[type="password"]');
  const socials = signInModal?.querySelectorAll('.social-btn');
  const authScreen = document.getElementById('authScreen');

  signInBtn?.addEventListener('click', () => openModal(signInModal));
  enterAppBtn?.addEventListener('click', async () => {
    if (!emailInput || !passwordInput) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    try {
      await navifyEmailSignIn(email, password);
      closeModal(signInModal);
      authScreen?.setAttribute('hidden', 'true');
      window.location.href = 'home.html';
    } catch (err) {
      console.error('Email sign-in failed', err);
      alert('Sign in failed. Check your details or try Google/Facebook.');
    }
  });

  if (socials && socials.length) {
    socials.forEach((btn) => {
      const label = btn.textContent?.toLowerCase().trim();
      if (label === 'google') {
        btn.addEventListener('click', async () => {
          try {
            await navifyGoogleSignIn();
            closeModal(signInModal);
            authScreen?.setAttribute('hidden', 'true');
            window.location.href = 'home.html';
          } catch (err) {
            console.error('Google sign-in failed', err);
            alert('Google sign-in failed. Check your Firebase configuration.');
          }
        });
      }
      if (label === 'facebook') {
        btn.addEventListener('click', async () => {
          try {
            await navifyFacebookSignIn();
            closeModal(signInModal);
            authScreen?.setAttribute('hidden', 'true');
            window.location.href = 'home.html';
          } catch (err) {
            console.error('Facebook sign-in failed', err);
            alert('Facebook sign-in failed. Check your Firebase configuration.');
          }
        });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', bindSignIn);

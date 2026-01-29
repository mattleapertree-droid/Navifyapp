function initMenuPanels() {
  const toggles = document.querySelectorAll('[data-panel-toggle]');
  toggles.forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    const selector = btn.getAttribute('data-panel-toggle');
    const panel = selector ? document.querySelector(selector) : null;
    if (!panel) return;
    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
    });
  });
}

function initPushToggle() {
  const pushToggleBtn = document.getElementById('pushToggleBtn');
  if (!pushToggleBtn) return;
  const stored = localStorage.getItem('navify-push');
  let pushEnabled = stored === 'on';
  pushToggleBtn.textContent = pushEnabled ? 'Push notifications: On' : 'Push notifications: Off';
  pushToggleBtn.addEventListener('click', async () => {
    if (!window.isSecureContext) {
      alert('Push notifications require HTTPS or localhost.');
      return;
    }
    if (!('Notification' in window)) {
      alert('Push notifications are not supported on this device or browser.');
      return;
    }
    if (Notification.permission === 'granted') {
      pushEnabled = !pushEnabled;
      localStorage.setItem('navify-push', pushEnabled ? 'on' : 'off');
      pushToggleBtn.textContent = pushEnabled ? 'Push notifications: On' : 'Push notifications: Off';
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      pushEnabled = true;
      localStorage.setItem('navify-push', 'on');
      pushToggleBtn.textContent = 'Push notifications: On';
    } else {
      pushEnabled = false;
      localStorage.setItem('navify-push', 'off');
      pushToggleBtn.textContent = 'Push notifications: Off';
    }
  });
}

function initSecurityActions() {
  const settingsPhoneInput = document.getElementById('settingsPhoneInput');
  const settingsPhoneCodeInput = document.getElementById('settingsPhoneCodeInput');
  const sendSmsBtn = document.getElementById('sendSmsBtn');
  const confirmSmsBtn = document.getElementById('confirmSmsBtn');
  const settingsPasswordInput = document.getElementById('settingsPasswordInput');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const verifyEmailBtn = document.getElementById('verifyEmailBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  sendSmsBtn?.addEventListener('click', async () => {
    if (!settingsPhoneInput) return;
    const phone = settingsPhoneInput.value.trim();
    if (!phone) {
      alert('Enter a phone number first.');
      return;
    }
    if (!window.navifyStartPhoneVerification) {
      alert('Phone verification is not available.');
      return;
    }
    try {
      await navifyStartPhoneVerification(phone, 'recaptcha-container');
      alert('Verification code sent. Check your SMS messages.');
    } catch (err) {
      alert('Could not start phone verification: ' + (err && err.message ? err.message : err));
    }
  });

  confirmSmsBtn?.addEventListener('click', async () => {
    if (!settingsPhoneCodeInput) return;
    const code = settingsPhoneCodeInput.value.trim();
    if (!code) {
      alert('Enter the SMS code you received.');
      return;
    }
    if (!window.navifyConfirmPhoneCode) {
      alert('Phone verification is not available.');
      return;
    }
    try {
      await navifyConfirmPhoneCode(code);
      const phone = settingsPhoneInput?.value.trim() || '';
      if (phone) {
        localStorage.setItem('navify-phone', phone);
      }
      alert('Phone number verified for this account.');
    } catch (err) {
      alert('Could not verify code: ' + (err && err.message ? err.message : err));
    }
  });

  changePasswordBtn?.addEventListener('click', async () => {
    if (!settingsPasswordInput) return;
    const newPw = settingsPasswordInput.value.trim();
    if (!newPw || newPw.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (!window.navifyChangePassword) {
      alert('Password change is not available.');
      return;
    }
    try {
      await navifyChangePassword(newPw);
      alert('Password updated. Use the new password next time you sign in.');
      settingsPasswordInput.value = '';
    } catch (err) {
      alert('Could not update password: ' + (err && err.message ? err.message : err));
    }
  });

  verifyEmailBtn?.addEventListener('click', async () => {
    if (!window.navifySendEmailVerification) {
      alert('Email verification is not available.');
      return;
    }
    try {
      await navifySendEmailVerification();
      alert('Verification email sent. Check your inbox.');
    } catch (err) {
      alert('Could not send verification email: ' + (err && err.message ? err.message : err));
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    if (!window.navifySignOut) {
      window.location.href = 'index.html';
      return;
    }
    try {
      await navifySignOut();
    } finally {
      window.location.href = 'index.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuPanels();
  initPushToggle();
  initSecurityActions();
});

document.addEventListener('click', (e) => {
  const target = e.target.closest && e.target.closest('[data-panel-toggle]');
  if (!target) return;
  const selector = target.getAttribute('data-panel-toggle');
  const panel = selector ? document.querySelector(selector) : null;
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  target.classList.toggle('open', isOpen);
});

// Helper functions around Firebase Auth so the rest of Navify
// can call a small, clean API. Make sure firebase-init.js ran
// and window.navifyAuth is available.

function requireNavifyAuth() {
  if (!window.navifyAuth) {
    throw new Error('Navify auth is not configured. Set your Firebase config in auth/firebase-init.js.');
  }
  return window.navifyAuth;
}

async function navifyEmailSignIn(email, password) {
  const auth = requireNavifyAuth();
  const cred = await auth.signInWithEmailAndPassword(email, password);
  storeNavifyUser(cred.user);
  return cred.user;
}

async function navifyEmailSignUp(email, password, displayName) {
  const auth = requireNavifyAuth();
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName) {
    await cred.user.updateProfile({ displayName });
  }
  try {
    await cred.user.sendEmailVerification();
  } catch (_) {
    // Ignore email verification failure here; user can retry from settings
  }
  storeNavifyUser(cred.user);
  return cred.user;
}

async function navifyGoogleSignIn() {
  const auth = requireNavifyAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  const cred = await auth.signInWithPopup(provider);
  storeNavifyUser(cred.user);
  return cred.user;
}

async function navifyFacebookSignIn() {
  const auth = requireNavifyAuth();
  const provider = new firebase.auth.FacebookAuthProvider();
  const cred = await auth.signInWithPopup(provider);
  storeNavifyUser(cred.user);
  return cred.user;
}

function storeNavifyUser(user) {
  if (!user) return;
  const data = {
    uid: user.uid,
    email: user.email || null,
    name: user.displayName || null,
    photoURL: user.photoURL || null,
  };
  localStorage.setItem('navify-user', JSON.stringify(data));
  if (data.name) {
    localStorage.setItem('navify-name', data.name);
  }
}

function getNavifyUser() {
  try {
    return JSON.parse(localStorage.getItem('navify-user') || 'null');
  } catch (_) {
    return null;
  }
}

function navifyOnAuth(callback) {
  const auth = requireNavifyAuth();
  auth.onAuthStateChanged((user) => {
    if (user) storeNavifyUser(user);
    if (typeof callback === 'function') callback(user || null);
  });
}

async function navifySendEmailVerification() {
  const auth = requireNavifyAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to verify your email.');
  }
  await user.sendEmailVerification();
  storeNavifyUser(user);
  return user;
}

async function navifyChangePassword(newPassword) {
  const auth = requireNavifyAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to change your password.');
  }
  await user.updatePassword(newPassword);
  storeNavifyUser(user);
  return user;
}

async function navifySignOut() {
  const auth = requireNavifyAuth();
  await auth.signOut();
  localStorage.removeItem('navify-user');
}

let navifyPhoneRecaptcha = null;
let navifyPhoneConfirmation = null;

function navifyEnsureRecaptcha(containerId = 'recaptcha-container') {
  if (!firebase || !firebase.auth) {
    throw new Error('Firebase Auth is not available for phone verification.');
  }
  if (!navifyPhoneRecaptcha) {
    navifyPhoneRecaptcha = new firebase.auth.RecaptchaVerifier(containerId, {
      size: 'invisible'
    });
    window.recaptchaVerifier = navifyPhoneRecaptcha;
  }
  return navifyPhoneRecaptcha;
}

async function navifyStartPhoneVerification(phoneNumber, containerId = 'recaptcha-container') {
  const auth = requireNavifyAuth();
  const appVerifier = navifyEnsureRecaptcha(containerId);
  const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
  navifyPhoneConfirmation = confirmationResult;
  window.confirmationResult = confirmationResult;
  return true;
}

async function navifyConfirmPhoneCode(code) {
  if (!navifyPhoneConfirmation) {
    throw new Error('No phone verification is in progress.');
  }
  const cred = await navifyPhoneConfirmation.confirm(code);
  storeNavifyUser(cred.user);
  navifyPhoneConfirmation = null;
  window.confirmationResult = null;
  return cred.user;
}

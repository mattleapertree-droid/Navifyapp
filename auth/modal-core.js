function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
}

function bindCloseHandlers() {
  const closeButtons = document.querySelectorAll('[data-close]');
  closeButtons.forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close');
      closeModal(document.querySelector(target));
    });
  });

  ['signInModal', 'signUpModal', 'avatarModal', 'transportModal', 'categoryModal'].forEach((id) => {
    const modal = document.getElementById(id);
    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = 'true';
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindCloseHandlers();
  // Rebind after modals are injected dynamically
  setTimeout(bindCloseHandlers, 0);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(document.getElementById('signInModal'));
    closeModal(document.getElementById('signUpModal'));
  }
});

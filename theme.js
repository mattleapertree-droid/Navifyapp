const THEME_KEY = 'navify-theme';

function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.body.classList.toggle('theme-light', t === 'light');
}

function labelForTheme(theme) {
  return theme === 'light' ? 'Dark Mode' : 'Light Mode';
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
  const toggle = document.querySelector('.toggle');
  if (toggle) {
    toggle.textContent = labelForTheme(saved);
    toggle.addEventListener('click', () => {
      const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      toggle.textContent = labelForTheme(next);
    });
  }
});

(function () {
    'use strict';
    const key = 'portfolio-theme';
    let saved;
    try { saved = localStorage.getItem(key); } catch { /* Use the device preference when storage is unavailable. */ }
    let theme = ['light','dark'].includes(saved) ? saved : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    function apply() {
        document.documentElement.dataset.theme = theme;
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.textContent = theme === 'dark' ? 'Claro' : 'Oscuro';
            button.setAttribute('aria-label', theme === 'dark' ? 'Cambiar al tema claro' : 'Cambiar al tema oscuro');
            button.setAttribute('aria-pressed', String(theme === 'dark'));
        });
    }
    apply();
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, theme); } catch { /* Keep the current-page choice. */ }
        apply();
    }));
}());

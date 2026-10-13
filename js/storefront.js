(function () {
    'use strict';

    function updateStoreLanguage() {
        const language = window.ArmandoI18n?.getLanguage() === 'es' ? 'es' : 'en';
        document.querySelectorAll('[data-store-link]').forEach(link => {
            const destination = new URL(link.href);
            destination.searchParams.set('lang', language);
            link.href = destination.href;
        });
    }

    updateStoreLanguage();
    document.addEventListener('armandocode:languagechange', updateStoreLanguage);
}());

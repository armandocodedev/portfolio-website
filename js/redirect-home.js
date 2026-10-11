(function () {
    'use strict';
    const home = document.querySelector('[data-home-redirect]');
    if (!home) return;
    const destination = new URL(home.href);
    destination.search = window.location.search;
    // Retired section anchors have no equivalent on the consolidated homepage.
    destination.hash = '';
    window.location.replace(destination.href);
}());

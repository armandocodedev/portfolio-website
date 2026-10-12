const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../js/analytics.js'), 'utf8');

function setup({ consent, savedCampaign, language = 'en' } = {}) {
    const local = new Map([['analytics-consent', 'accepted'], ...(consent ? [['armandocode-posthog-consent', consent]] : [])]);
    const session = new Map(savedCampaign ? [['armandocode-campaign-context', JSON.stringify(savedCampaign)]] : []);
    const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });
    const listeners = {};
    const scripts = [];
    const captured = [];
    let optedOut = false;
    const banner = { hidden: true, setAttribute() { this.hidden = true; }, removeAttribute() { this.hidden = false; } };
    const buttons = ['accepted', 'rejected'].map(choice => ({ dataset: { cookieChoice: choice }, addEventListener(name, callback) { this.click = callback; } }));
    const reset = { addEventListener(name, callback) { this.click = callback; } };
    const frame = { hidden: true };
    const section = { dataset: { surveyUrl: 'https://us.posthog.com/external_surveys/test' }, querySelector: () => frame };
    const surveyButton = { closest: () => section, addEventListener(name, callback) { this.click = callback; }, hidden: false };
    const window = { ArmandoI18n: { getLanguage: () => language }, location: { origin: 'https://armandocode.com', hostname: 'armandocode.com', pathname: '/lab/', search: '', reload() { this.reloaded = true; } } };
    const document = {
        referrer: 'https://www.instagram.com/some-path?private=discard',
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: script => scripts.push(script) } }],
        querySelector: () => banner,
        querySelectorAll(selector) {
            return selector === '[data-cookie-choice]' ? buttons : selector === '[data-reset-cookie-choice]' ? [reset] : selector === '[data-open-survey]' ? [surveyButton] : selector === '[data-survey-section]' ? [section] : [];
        },
        addEventListener(name, callback) { listeners[name] = callback; }
    };
    vm.runInNewContext(source, { window, document, localStorage: storage(local), sessionStorage: storage(session), URL, URLSearchParams });
    listeners.DOMContentLoaded();
    function finishLoading() {
        const queue = window.posthog;
        const config = queue._i[0][1];
        const client = {
            opt_in_capturing() { optedOut = false; },
            opt_out_capturing() { optedOut = true; },
            register(properties) { this.properties = properties; },
            capture(name, properties) { if (!optedOut && config.before_send({ event: name })) captured.push({ name, properties }); }
        };
        window.posthog = client;
        config.loaded(client);
        for (const [method, ...args] of queue) client[method]?.(...args);
        return { client, config };
    }
    return { window, listeners, scripts, buttons, reset, frame, surveyButton, banner, captured, finishLoading };
}

test('no analytics SDK before consent; survey remains independently available', () => {
    const page = setup();
    assert.equal(page.banner.hidden, false);
    assert.equal(page.scripts.length, 0);
    page.buttons[1].click();
    page.surveyButton.click();
    assert.equal(page.scripts.length, 0);
    assert.equal(page.frame.src, 'https://us.posthog.com/external_surveys/test?display_language=en');
    assert.equal(page.frame.hidden, false);
    assert.equal(page.surveyButton.hidden, true);
});

test('accepted tracking uses the current page and retained Instagram attribution', () => {
    const page = setup({ consent: 'accepted', savedCampaign: { page_path: '/', page_location: 'old', utm_source: 'instagram', utm_campaign: 'bio' } });
    assert.equal(page.scripts.length, 1);
    assert.equal(page.scripts[0].src, 'https://us-assets.i.posthog.com/static/array.js');
    const { config } = page.finishLoading();
    assert.equal(config.autocapture, false);
    assert.equal(config.disable_session_recording, true);
    assert.equal(config.disable_surveys, true);
    assert.equal(page.captured[0].name, '$pageview');
    assert.equal(page.captured[0].properties.page_path, '/lab/');
    assert.equal(page.captured[0].properties.utm_source, 'instagram');
    assert.equal(page.captured[0].properties.referrer, 'https://www.instagram.com');
    assert.equal(page.captured[0].properties.site_language, 'en');
    const element = { dataset: { analyticsEvent: 'contact_click', cta: 'contact_email' }, protocol: 'mailto:', textContent: 'Email', getAttribute: () => 'mailto:example@example.com' };
    page.listeners.click({ target: { closest: () => element } });
    assert.equal(page.captured[1].name, 'contact_click');
    assert.equal(page.captured[1].properties.destination, 'email');
});

test('withdrawing consent blocks queued events even while the SDK is loading', () => {
    const page = setup({ consent: 'accepted' });
    page.buttons[1].click();
    page.finishLoading();
    assert.equal(page.captured.length, 0);
});

test('reset opts out immediately and reloads to stop tracking', () => {
    const page = setup({ consent: 'accepted' });
    page.finishLoading();
    page.reset.click();
    assert.equal(page.window.location.reloaded, true);
    const element = { dataset: { analyticsEvent: 'open_lab' }, textContent: 'Apps', getAttribute: () => 'lab/' };
    page.listeners.click({ target: { closest: () => element } });
    assert.equal(page.captured.length, 1);
});

test('survey links retain campaign tags without sending a visitor identifier', () => {
    const page = setup({ savedCampaign: { utm_source: 'instagram', utm_campaign: 'bio' } });
    page.surveyButton.click();
    const url = new URL(page.frame.src);
    assert.equal(url.searchParams.get('utm_source'), 'instagram');
    assert.equal(url.searchParams.get('utm_campaign'), 'bio');
    assert.equal(url.searchParams.has('distinct_id'), false);
});

for (const language of ['en', 'es', 'pt-BR']) {
    test('survey and consented metrics use the selected language: ' + language, () => {
        const page = setup({ language, consent: 'accepted' });
        page.finishLoading();
        page.surveyButton.click();
        assert.equal(new URL(page.frame.src).searchParams.get('display_language'), language.toLowerCase());
        assert.equal(page.captured[0].properties.site_language, language);
        assert.equal(page.captured[1].properties.site_language, language);
    });
}

test('changing language reloads only an open survey and never bypasses analytics consent', () => {
    const page = setup();
    page.window.ArmandoI18n.getLanguage = () => 'es';
    page.listeners['armandocode:languagechange']();
    assert.equal(page.frame.src, undefined);
    page.surveyButton.click();
    page.window.ArmandoI18n.getLanguage = () => 'pt-BR';
    page.listeners['armandocode:languagechange']();
    assert.equal(new URL(page.frame.src).searchParams.get('display_language'), 'pt-br');
    assert.equal(page.scripts.length, 0);
    assert.equal(page.captured.length, 0);
});

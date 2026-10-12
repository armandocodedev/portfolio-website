const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { messages, normalizeLanguage, chooseLanguage } = require('../js/i18n.js');
const source = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');

test('all three locales contain complete, nonempty translations', () => {
    assert.deepEqual(Object.keys(messages), ['en', 'es', 'pt-BR']);
    for (const values of Object.values(messages)) {
        assert.deepEqual(Object.keys(values).sort(), Object.keys(messages.en).sort());
        assert.ok(Object.values(values).every(value => typeof value === 'string' && value.trim()));
    }
});

test('every marked HTML translation exists in every locale', () => {
    for (const file of ['index.html', 'privacy.html']) {
        const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        for (const match of html.matchAll(/data-i18n(?:-aria-label|-title|-alt|-content)?="([^"]+)"/g)) {
            for (const values of Object.values(messages)) assert.ok(values[match[1]], match[1]);
        }
        assert.ok(html.indexOf('js/i18n.js') < html.indexOf('js/analytics.js'));
        assert.match(html, /<select data-language-select>/);
    }
});

test('saved choices win, browser regional languages normalize, unsupported languages fall back', () => {
    assert.equal(chooseLanguage('es', ['pt-BR']), 'es');
    assert.equal(chooseLanguage(null, ['fr', 'pt-PT', 'en']), 'pt-BR');
    assert.equal(chooseLanguage(null, ['es-AR', 'en']), 'es');
    assert.equal(chooseLanguage('bad', ['de']), 'en');
    assert.equal(normalizeLanguage('PT-br'), 'pt-BR');
});

function mount({ saved, browsers = ['en'], blockedStorage = false, openSurvey = false } = {}) {
    const storage = new Map(saved ? [['armandocode-language', saved]] : []);
    const events = [];
    const title = { dataset: { i18n: 'interestHeading' } };
    const selector = { addEventListener(name, callback) { this.change = callback; } };
    const control = () => ({ addEventListener(name, callback) { this.click = callback; } });
    const keep = control();
    const confirm = control();
    const dialog = {
        keep, confirm, open: false,
        querySelector: query => query === '[data-keep-language]' ? keep : confirm,
        addEventListener(name, callback) { this.cancel = callback; },
        showModal() { this.open = true; },
        close() { this.open = false; }
    };
    const document = {
        documentElement: {},
        querySelector: query => query === '[data-language-dialog]' ? dialog : openSurvey ? { hidden: false } : null,
        querySelectorAll: query => query === '[data-i18n]' ? [title] : query === '[data-language-select]' ? [selector] : [],
        dispatchEvent: event => events.push(event)
    };
    const window = {};
    vm.runInNewContext(source, {
        document, window, navigator: { languages: browsers },
        localStorage: {
            getItem(key) { if (blockedStorage) throw Error('blocked'); return storage.get(key); },
            setItem(key, value) { if (blockedStorage) throw Error('blocked'); storage.set(key, value); }
        },
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
    });
    return { window, document, title, selector, storage, events, dialog };
}

test('switching applies text and lang, persists choice, and survives another page load', () => {
    const page = mount({ browsers: ['es-AR'] });
    assert.equal(page.document.documentElement.lang, 'es');
    page.selector.value = 'pt-BR';
    page.selector.change();
    assert.equal(page.title.textContent, messages['pt-BR'].interestHeading);
    assert.equal(page.document.documentElement.lang, 'pt-BR');
    assert.equal(page.events[0].detail.previous, 'es');
    assert.equal(mount({ saved: page.storage.get('armandocode-language'), browsers: ['en'] }).selector.value, 'pt-BR');
});

test('blocked browser storage does not break detection or switching', () => {
    const page = mount({ browsers: ['pt-BR'], blockedStorage: true });
    assert.equal(page.selector.value, 'pt-BR');
    page.selector.value = 'es';
    page.selector.change();
    assert.equal(page.document.documentElement.lang, 'es');
});

test('canceling a language switch preserves the open survey and prior selection', () => {
    const page = mount({ saved: 'es', openSurvey: true });
    page.selector.value = 'pt-BR';
    page.selector.change();
    assert.equal(page.dialog.open, true);
    page.dialog.keep.click();
    assert.equal(page.dialog.open, false);
    assert.equal(page.selector.value, 'es');
    assert.equal(page.events.length, 0);
    assert.equal(page.storage.get('armandocode-language'), 'es');
});

test('approving a language switch changes the locale and emits one restart event', () => {
    const page = mount({ saved: 'es', openSurvey: true });
    page.selector.value = 'pt-BR';
    page.selector.change();
    page.dialog.confirm.click();
    assert.equal(page.document.documentElement.lang, 'pt-BR');
    assert.equal(page.events.length, 1);
    assert.equal(page.events[0].type, 'armandocode:languagechange');
});

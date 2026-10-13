const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const home = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '../js/storefront.js'), 'utf8');

test('unreleased course cannot route visitors into a private preview or checkout', () => {
    const card = home.split('<article class="course-card" aria-labelledby="instagram-course-title">')[1].split('</article>')[0];
    assert.match(card, /courseComingSoon/);
    assert.match(card, /courseNotOnSale/);
    assert.doesNotMatch(card, /<a\b|<button\b/);
    assert.doesNotMatch(home, /melonplace\.com\/admin/);
});

test('store destinations retain campaign attribution and only verified language values', () => {
    const links = [
        { href: 'https://armandocode.melonplace.com/?utm_source=armandocode.com&utm_medium=website&utm_campaign=courses&utm_content=browse_store' },
        { href: 'https://armandocode.melonplace.com/accion/course-ai-generate-avatar?utm_source=armandocode.com&utm_medium=website&utm_campaign=courses&utm_content=avatar_course' }
    ];
    let language = 'es';
    let onLanguageChange;
    vm.runInNewContext(source, {
        URL,
        window: { ArmandoI18n: { getLanguage: () => language } },
        document: {
            querySelectorAll: () => links,
            addEventListener: (event, callback) => { onLanguageChange = callback; }
        }
    });
    for (const link of links) assert.equal(new URL(link.href).searchParams.get('lang'), 'es');
    for (language of ['en', 'pt-BR']) {
        onLanguageChange();
        for (const link of links) {
            const url = new URL(link.href);
            assert.equal(url.hostname, 'armandocode.melonplace.com');
            assert.equal(url.searchParams.get('lang'), 'en');
            assert.equal(url.searchParams.get('utm_source'), 'armandocode.com');
            assert.equal(url.searchParams.get('utm_campaign'), 'courses');
            assert.ok(url.searchParams.get('utm_content'));
        }
    }
});

test('course integration preserves audience survey priority and uses consent-gated tracking', () => {
    assert.ok(home.indexOf('id="community"') < home.indexOf('id="courses"'));
    assert.match(home, /href="#courses"/);
    assert.equal((home.match(/data-store-link data-analytics-event="store_visit"/g) || []).length, 2);
    assert.doesNotMatch(source, /fetch\(|localStorage|sessionStorage|posthog/);
});

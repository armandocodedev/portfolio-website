const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../js/redirect-home.js'), 'utf8');

for (const [file, prefix] of [['lab/index.html', '../'], ['lab/reserva/index.html', '../../']]) {
    test(file + ' is a lightweight redirect with a no-JavaScript fallback', () => {
        const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        assert.ok(html.includes('data-home-redirect href="' + prefix + '"'));
        assert.ok(html.includes('content="0;url=' + prefix + '"'));
        assert.match(html, /<noscript><meta http-equiv="refresh"/);
        assert.match(html, /<meta name="robots" content="noindex">/);
        assert.doesNotMatch(html, /analytics.js|ada.js|data-open-survey|Request pilot/);
    });
}

for (const base of ['https://armandocode.com/', 'http://127.0.0.1:4173/', 'https://example.test/portfolio-website/']) {
    test('redirect preserves attribution without leaving its configured home: ' + base, () => {
        let destination;
        const search = '?utm_source=instagram&utm_medium=social&utm_campaign=bio&next=https%3A%2F%2Fother.test';
        vm.runInNewContext(script, {
            URL,
            document: { querySelector: () => ({ href: base }) },
            window: { location: { search, replace: value => { destination = value; } } }
        });
        assert.equal(destination, base + search);
        assert.equal(new URL(destination).hash, '');
    });
}

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const file of ['index.html', 'lab/index.html']) {
    test(file + ' prioritizes audience research over project promotion', () => {
        const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        assert.ok(html.indexOf('id="community"') < html.indexOf('id="echostory-title"'));
        assert.match(html, /data-open-survey/);
        assert.match(html, /Vote without an email/);
        assert.match(html, /data-app-slug="echostory"/);
        assert.doesNotMatch(html, /linkedin\.com|github\.com|class="project-grid"/);
        assert.match(html, /data-analytics-event="contact_click"/);
    });
}

test('Reserva is absent from the homepage and tucked into Lab details', () => {
    const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const lab = fs.readFileSync(path.join(__dirname, '..', 'lab/index.html'), 'utf8');
    assert.doesNotMatch(home, /reserva/i);
    assert.match(lab, /<details>[\s\S]*data-app-slug="reserva"[\s\S]*<\/details>/);
    assert.doesNotMatch(lab, /<details\s+open/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const file of ['index.html']) {
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

test('homepage no longer promotes retired Lab or Reserva pages', () => {
    const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.doesNotMatch(home, /reserva/i);
    assert.doesNotMatch(home, /href="lab\//);
});

test('privacy navigation targets current pages and retains consent reset', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'privacy.html'), 'utf8');
    assert.doesNotMatch(html, /#about|#projects|#contact|Back to portfolio/);
    assert.match(html, /data-reset-cookie-choice/);
    assert.match(html, /src="js\/analytics.js"/);
    assert.match(html, /data-cta="privacy_contact_email"/);
});

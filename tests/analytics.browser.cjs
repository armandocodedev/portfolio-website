// node --test tests/analytics.browser.cjs
// Uses Chrome and serves local files under a simulated production origin.
// No real analytics requests, survey submissions, or store purchases are sent.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

test('production course completion and pageleave work; localhost sends nothing', async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
    try {
        const context = await browser.newContext();
        const root = path.resolve(__dirname, '..');
        let sdkRequests = 0;
        await context.addInitScript(() => localStorage.setItem('armandocode-posthog-consent', 'accepted'));
        await context.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.hostname === 'us-assets.i.posthog.com') {
                sdkRequests++;
                return route.fulfill({ contentType: 'application/javascript', body: `
                    const queue = window.posthog; const config = queue._i[0][1];
                    window.testAnalyticsEvents = []; let optedOut = false;
                    const client = { opt_in_capturing() { optedOut = false; }, opt_out_capturing() { optedOut = true; },
                        register() {}, capture(event, properties) { if (!optedOut && config.before_send({event})) window.testAnalyticsEvents.push({event,properties}); } };
                    window.posthog = client; config.loaded(client);
                    for (const [method, ...args] of queue) client[method]?.(...args);
                ` });
            }
            if (!['armandocode.com', 'localhost'].includes(url.hostname)) return route.abort();
            let filename = path.resolve(root, '.' + decodeURIComponent(url.pathname));
            if (filename !== root && !filename.startsWith(root + path.sep)) return route.abort();
            if (url.pathname.endsWith('/')) filename = path.join(filename, 'index.html');
            const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
            try { return route.fulfill({ contentType: types[path.extname(filename)] || 'application/octet-stream', body: await fs.readFile(filename) }); }
            catch { return route.fulfill({ status: 404, body: '' }); }
        });
        const page = await context.newPage();
        await page.goto('https://armandocode.com/courses/primeros-pasos-ia/');
        await page.waitForFunction(() => window.testAnalyticsEvents?.some(e => e.event === 'course_started'));
        const count = event => page.evaluate(name => window.testAnalyticsEvents.filter(e => e.event === name).length, event);
        assert.equal(await count('$pageview'), 1);
        assert.equal(await count('course_started'), 1);
        for (const button of await page.locator('[data-complete]').all()) await button.click();
        await page.evaluate(() => {
            window.AICourseCore.questions.forEach((question, i) => document.querySelector(`input[name=q${i}][value="${(question.answer + 1) % 3}"]`).checked = true);
            document.getElementById('quiz').requestSubmit();
        });
        assert.equal(await count('course_completed'), 0);
        await page.locator('#retry').click();
        await page.evaluate(() => {
            window.AICourseCore.questions.forEach((question, i) => document.querySelector(`input[name=q${i}][value="${question.answer}"]`).checked = true);
            document.getElementById('quiz').requestSubmit();
        });
        assert.equal(await count('course_completed'), 1);
        await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
        assert.equal(await count('$pageleave'), 1);
        await page.reload();
        await page.waitForFunction(() => window.testAnalyticsEvents?.some(e => e.event === 'course_started'));
        assert.equal(await count('course_completed'), 0);
        const before = sdkRequests;
        const local = await context.newPage();
        await local.goto('http://localhost/');
        assert.equal(await local.evaluate(() => typeof window.posthog), 'undefined');
        assert.equal(sdkRequests, before);
        await context.close();
    } finally { await browser.close(); }
});

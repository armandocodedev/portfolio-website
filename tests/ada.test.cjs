const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { selectGaze, mountMascot } = require('../js/ada.js');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/ada/frame-map.json')));

test('all sixteen exact directions map clockwise from screen up', () => {
    manifest.directions.forEach((direction, index) => {
        const radians = direction.degreesClockwiseFromUp * Math.PI / 180;
        assert.equal(selectGaze(Math.sin(radians) * 100, -Math.cos(radians) * 100), index);
        assert.equal(direction.compactAtlas.x, (index % 8) * 192);
        assert.equal(direction.compactAtlas.y, (1 + Math.floor(index / 8)) * 208);
    });
});

test('dead zone and circular hysteresis prevent boundary chatter', () => {
    assert.equal(selectGaze(0, 0, 8), null);
    assert.equal(selectGaze(24, 0), null);
    const at = (angle, previous) => selectGaze(Math.sin(angle * Math.PI / 180) * 100,
        -Math.cos(angle * Math.PI / 180) * 100, previous);
    assert.equal(at(12, 0), 0);
    assert.equal(at(15, 0), 1);
    assert.equal(at(348, 0), 0);
    assert.equal(at(345, 0), 15);
});

function harness(t, { reducedMotion = false, touch = false, fail = false } = {}) {
    const names = ['window', 'document', 'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'Image', 'fetch'];
    const original = Object.fromEntries(names.map(name => [name, global[name]]));
    t.after(() => names.forEach(name => {
        if (original[name] === undefined) delete global[name];
        else global[name] = original[name];
    }));
    const targets = [];
    function target(extra = {}) {
        const handlers = new Map();
        const value = {
            ...extra,
            handlers,
            addEventListener(name, callback) {
                if (!handlers.has(name)) handlers.set(name, new Set());
                handlers.get(name).add(callback);
            },
            removeEventListener(name, callback) { handlers.get(name)?.delete(callback); },
            emit(name, event = {}) { handlers.get(name)?.forEach(callback => callback(event)); }
        };
        targets.push(value);
        return value;
    }
    const frames = new Map();
    let nextFrame = 0;
    const reduced = target({ matches: reducedMotion });
    const fine = target({ matches: !touch });
    global.window = target({
        matchMedia: query => query.includes('reduced-motion') ? reduced : fine,
        requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
        cancelAnimationFrame(id) { frames.delete(id); }
    });
    global.document = target({ hidden: false, documentElement: target(), body: {} });
    const observers = {};
    for (const [name, key] of [['IntersectionObserver', 'intersection'], ['ResizeObserver', 'resize'], ['MutationObserver', 'removal']]) {
        global[name] = class {
            constructor(callback) { observers[key] = this; this.callback = callback; this.disconnected = false; }
            observe() {}
            disconnect() { this.disconnected = true; }
        };
    }
    const draws = [];
    const fallback = { hidden: false };
    const canvas = { hidden: true, getContext: () => ({
        clearRect() {},
        drawImage(...args) { draws.push(args); }
    }) };
    let rect = { left: 100, top: 100, width: 96, height: 104 };
    const element = {
        isConnected: true,
        querySelector: selector => selector === 'canvas' ? canvas : fallback,
        getBoundingClientRect: () => rect
    };
    const requests = [];
    const images = [];
    global.fetch = async (url, options) => {
        requests.push({ url: url.href, options });
        return { ok: !fail, json: async () => manifest };
    };
    global.Image = class { constructor() { images.push(this); } };
    const destroy = mountMascot(element, new URL('https://example.test/assets/ada/'));
    t.after(destroy);
    return {
        canvas, fallback, draws, frames, observers, requests, images, reduced, fine, element, destroy,
        visible(value) { observers.intersection.callback([{ isIntersecting: value }]); },
        async ready() {
            this.visible(true);
            await new Promise(resolve => setImmediate(resolve));
            images[0]?.onload();
        },
        point(x, y, pointerType = 'mouse') { document.emit('pointermove', { clientX: x, clientY: y, pointerType }); },
        flush() {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(callback => callback());
        },
        moveRect(value) { rect = { ...rect, ...value }; },
        listenerCount() { return targets.reduce((sum, item) => sum + [...item.handlers.values()].reduce((n, set) => n + set.size, 0), 0); }
    };
}

test('coalesces events, draws exact cells, and only redraws changed directions', async t => {
    const h = harness(t);
    await h.ready();
    assert.match(h.images[0].src, /ada-idle-gaze.png$/);
    for (const direction of manifest.directions) {
        const radians = direction.degreesClockwiseFromUp * Math.PI / 180;
        h.point(143.2 + Math.sin(radians) * 100, 141.6 - Math.cos(radians) * 100);
        h.point(143.2 + Math.sin(radians) * 101, 141.6 - Math.cos(radians) * 101);
        assert.equal(h.frames.size, 1);
        h.flush();
        assert.deepEqual(h.draws.at(-1).slice(1), [direction.compactAtlas.x, direction.compactAtlas.y, 192, 208, 0, 0, 192, 208]);
    }
    const count = h.draws.length;
    h.point(105, 50);
    h.flush();
    assert.equal(h.draws.length, count);
    h.point(143.2, 141.6);
    h.flush();
    assert.equal(h.canvas.hidden, true);
    assert.equal(h.fallback.hidden, false);
});

test('scroll and resize use fresh geometry; exit restores neutral', async t => {
    const h = harness(t);
    await h.ready();
    h.point(300, 141.6);
    h.flush();
    assert.equal(h.draws.at(-1)[1], 768);
    h.moveRect({ left: 350 });
    window.emit('scroll');
    h.flush();
    assert.equal(h.draws.at(-1)[2], 416);
    h.moveRect({ left: 100 });
    window.emit('resize');
    h.flush();
    assert.equal(h.draws.at(-1)[2], 208);
    document.documentElement.emit('pointerleave');
    assert.equal(h.canvas.hidden, true);
    assert.equal(h.frames.size, 0);
    h.point(300, 100, 'touch');
    assert.equal(h.frames.size, 0);
});

test('reduced motion and touch-only never load the atlas or schedule tracking', async t => {
    const h = harness(t, { reducedMotion: true });
    await h.ready();
    h.point(300, 100);
    assert.equal(h.requests.length, 0);
    assert.equal(h.frames.size, 0);
    h.reduced.matches = false;
    h.fine.matches = false;
    h.fine.emit('change');
    h.point(300, 100);
    assert.equal(h.requests.length, 0);
    assert.equal(h.fallback.hidden, false);
});

test('pauses hidden/offscreen and cleans up observers, callbacks, and listeners on removal', async t => {
    const h = harness(t);
    await h.ready();
    h.point(300, 100);
    document.hidden = true;
    document.emit('visibilitychange');
    assert.equal(h.frames.size, 0);
    assert.equal(h.canvas.hidden, true);
    document.hidden = false;
    document.emit('visibilitychange');
    h.visible(false);
    h.point(300, 100);
    assert.equal(h.frames.size, 0);
    h.visible(true);
    h.point(300, 100);
    h.element.isConnected = false;
    h.observers.removal.callback();
    assert.equal(h.listenerCount(), 0);
    assert.equal(h.frames.size, 0);
    assert.ok(Object.values(h.observers).every(observer => observer.disconnected));
    assert.equal(h.requests[0].options.signal.aborted, true);
    assert.equal(h.images[0].onload, null);
    h.destroy();
});

test('failed manifest keeps the static fallback visible', async t => {
    const h = harness(t, { fail: true });
    await h.ready();
    h.point(300, 100);
    h.flush();
    assert.equal(h.images.length, 0);
    assert.equal(h.fallback.hidden, false);
    assert.equal(h.canvas.hidden, true);
});

test('touch-only initially uses only the neutral PNG', async t => {
    const h = harness(t, { touch: true });
    await h.ready();
    h.point(300, 100, 'touch');
    assert.equal(h.requests.length, 0);
    assert.equal(h.images.length, 0);
    assert.equal(h.frames.size, 0);
    assert.equal(h.fallback.hidden, false);
});

test('late image load cannot redraw after unmount; atlas failure and pointer-out stay neutral', async t => {
    const h = harness(t);
    h.visible(true);
    await new Promise(resolve => setImmediate(resolve));
    const lateLoad = h.images[0].onload;
    h.images[0].onerror();
    assert.equal(h.canvas.hidden, true);
    h.point(300, 100);
    document.emit('pointerout', { relatedTarget: null });
    assert.equal(h.frames.size, 0);
    h.destroy();
    lateLoad();
    assert.equal(h.frames.size, 0);
    assert.equal(h.canvas.hidden, true);
});

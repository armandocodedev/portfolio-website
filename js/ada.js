(function () {
    'use strict';

    const SECTOR = 22.5;
    const DEAD_ZONE = 24;
    const HYSTERESIS = 3;

    function selectGaze(dx, dy, previous = null) {
        if (Math.hypot(dx, dy) <= DEAD_ZONE) return null;
        const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
        if (previous !== null) {
            const difference = Math.abs((angle - previous * SECTOR + 540) % 360 - 180);
            if (difference <= SECTOR / 2 + HYSTERESIS) return previous;
        }
        return Math.round(angle / SECTOR) % 16;
    }

    function mountMascot(element, assetBase) {
        const canvas = element.querySelector('canvas');
        const fallback = element.querySelector('img');
        const context = canvas.getContext('2d');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const fine = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
        const abort = new AbortController();
        const listeners = [];
        let destroyed = false;
        let visible = false;
        let pointer = null;
        let frame = null;
        let selected = null;
        let manifest = null;
        let atlas = null;
        let loading = false;

        function listen(target, name, callback, options) {
            target.addEventListener(name, callback, options);
            listeners.push(() => target.removeEventListener(name, callback, options));
        }

        function neutral() {
            selected = null;
            canvas.hidden = true;
            fallback.hidden = false;
        }

        function cancelFrame() {
            if (frame !== null) window.cancelAnimationFrame(frame);
            frame = null;
        }

        function active() {
            return !destroyed && visible && !document.hidden && !reduced.matches && fine.matches;
        }

        function render() {
            frame = null;
            if (!active() || !pointer || !atlas || !manifest) return;
            // client coordinates and this fresh rectangle stay aligned through scroll/reflow.
            const rect = element.getBoundingClientRect();
            const index = selectGaze(pointer.x - rect.left - rect.width * 0.45,
                pointer.y - rect.top - rect.height * 0.4, selected);
            if (index === selected) return;
            if (index === null) {
                neutral();
                return;
            }
            const source = manifest.directions[index].compactAtlas;
            const { width, height } = manifest.cell;
            context.clearRect(0, 0, width, height);
            context.drawImage(atlas, source.x, source.y, width, height, 0, 0, width, height);
            selected = index;
            canvas.hidden = false;
            fallback.hidden = true;
        }

        function schedule() {
            if (active() && pointer && atlas && frame === null) {
                frame = window.requestAnimationFrame(render);
            }
        }

        async function loadAtlas() {
            if (loading || atlas || !context || !active()) return;
            loading = true;
            try {
                const response = await fetch(new URL('frame-map.json', assetBase), { signal: abort.signal });
                if (!response.ok) throw new Error('Ada frame map unavailable');
                manifest = await response.json();
                if (destroyed) return;
                const image = new Image();
                image.onload = () => {
                    image.onload = image.onerror = null;
                    if (destroyed) return;
                    atlas = image;
                    schedule();
                };
                image.onerror = () => {
                    image.onload = image.onerror = null;
                    neutral();
                };
                pendingImage = image;
                image.src = new URL(manifest.atlases.compact.file, assetBase).href;
            } catch (error) {
                if (!destroyed) neutral();
            }
        }

        let pendingImage = null;

        function sync() {
            if (!active()) {
                cancelFrame();
                pointer = null;
                neutral();
                return;
            }
            loadAtlas();
            schedule();
        }

        function exit() {
            pointer = null;
            cancelFrame();
            neutral();
        }

        listen(document, 'pointermove', event => {
            if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
                exit();
                return;
            }
            if (!active()) return;
            pointer = { x: event.clientX, y: event.clientY };
            schedule();
        }, { passive: true });
        listen(document.documentElement, 'pointerleave', exit);
        listen(document, 'pointerout', event => {
            if (event.relatedTarget === null) exit();
        });
        listen(window, 'blur', exit);
        listen(document, 'visibilitychange', sync);
        listen(window, 'scroll', schedule, { passive: true, capture: true });
        listen(window, 'resize', schedule, { passive: true });
        listen(reduced, 'change', sync);
        listen(fine, 'change', sync);

        const intersection = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            sync();
        });
        intersection.observe(element);
        const resize = new ResizeObserver(schedule);
        resize.observe(element);

        function destroy() {
            if (destroyed) return;
            destroyed = true;
            cancelFrame();
            abort.abort();
            if (pendingImage) pendingImage.onload = pendingImage.onerror = null;
            listeners.forEach(remove => remove());
            intersection.disconnect();
            resize.disconnect();
            removal.disconnect();
            neutral();
        }

        // Static pages unmount on pagehide; removal also supports future client navigation.
        const removal = new MutationObserver(() => {
            if (!element.isConnected) destroy();
        });
        removal.observe(document.body, { childList: true, subtree: true });
        neutral();
        return destroy;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { selectGaze, mountMascot };
    }
    if (typeof document === 'undefined') return;

    const assetBase = new URL('../assets/ada/', document.currentScript.src);
    let disposers = [];
    function mount() {
        disposers.forEach(dispose => dispose());
        disposers = [...document.querySelectorAll('[data-ada-mascot]')]
            .map(element => mountMascot(element, assetBase));
    }
    window.addEventListener('pagehide', () => {
        disposers.forEach(dispose => dispose());
        disposers = [];
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted) mount();
    });
    mount();
}());

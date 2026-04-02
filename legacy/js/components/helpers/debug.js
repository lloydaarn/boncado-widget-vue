const params = new URLSearchParams(window.location.search);

export const DEBUG_ENABLED = params.get('debug') === '1';

export const debugData = {};

export function debugStore(key, value) {
    if (!DEBUG_ENABLED) return;
    debugData[key] = structuredClone(value);
}

// Expose to window for console access
if (DEBUG_ENABLED) {
    window.debugData = debugData;
}

// host.com?debug=1
// console: debugData
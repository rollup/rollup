import { t } from './t.js';

globalThis.tValue = t;
assert.strictEqual(globalThis.manualChunkEffect, undefined);

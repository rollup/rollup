import * as self from './a.js';
export * as m from './main.js';

const key = 'm';

assert.strictEqual(typeof self[key], 'object');

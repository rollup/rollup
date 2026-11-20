import * as a from './a.js';
export * as b from './b.js';

export const value = 'initialized';
const outer = 'm';
const inner = 'b';

assert.strictEqual(typeof a[outer][inner], 'object');
assert.strictEqual(a[outer][inner].inB, 'b');

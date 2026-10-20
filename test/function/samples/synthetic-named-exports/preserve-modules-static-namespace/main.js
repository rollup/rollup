import * as ns from './other.js';

assert.strictEqual(ns.foo, 'bar');
assert.deepStrictEqual(Object.keys(ns), ['foo']);

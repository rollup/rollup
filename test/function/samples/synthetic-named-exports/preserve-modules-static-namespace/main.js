import * as ns from './other.js';

assert.strictEqual(ns.foo, 'bar');
assert.strictEqual(ns.value, 'reexported');
assert.deepStrictEqual(Object.keys(ns).sort(), ['foo', 'value']);

import * as ns from './reexport.js';

assert.deepStrictEqual(ns, { __proto__: null, bar: 1, baz: 2 });
assert.strictEqual(ns.foo, undefined)
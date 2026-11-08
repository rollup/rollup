import * as ns from './dep.js';

assert.strictEqual(ns.mutable, 1);

assert.throws(() => {
	ns.mutable = 2;
}, TypeError);
assert.strictEqual(ns.mutable, 1);

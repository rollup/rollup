import ns from './proxy.js';
import { mutable, value } from './dep.js';

assert.strictEqual(ns.value, 1);

assert.throws(() => {
	delete ns.value;
}, TypeError);
assert.throws(() => {
	ns.mutable = 2;
}, TypeError);
assert.strictEqual(mutable, 1);
assert.strictEqual(value, 1);

assert.strictEqual(delete ns.missing, true);

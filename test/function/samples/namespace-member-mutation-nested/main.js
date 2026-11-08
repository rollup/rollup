import * as ns from './dep.js';
import { value } from './inner.js';

assert.strictEqual(ns.inner.value, 1);

assert.throws(() => {
	delete ns.inner.value;
}, TypeError);
assert.throws(() => {
	ns.inner.value = 2;
}, TypeError);
assert.strictEqual(value, 1);

ns.object.value = 2;
assert.strictEqual(ns.object.value, 2);
delete ns.object?.value;
assert.strictEqual(ns.object.value, undefined);

import * as ns from './dep.js';
import { constant, mutable, object } from './dep.js';

assert.strictEqual(ns.mutable, 1);

assert.throws(() => {
	ns.mutable = 2;
}, TypeError);
assert.strictEqual(mutable, 1);

assert.throws(() => {
	ns['mutable'] = 2;
}, TypeError);
assert.strictEqual(mutable, 1);

assert.throws(() => {
	ns.mutable += 1;
}, TypeError);
assert.throws(() => {
	ns.mutable++;
}, TypeError);
assert.throws(() => {
	--ns.mutable;
}, TypeError);
assert.throws(() => {
	[ns.mutable] = [5];
}, TypeError);
assert.throws(() => {
	({ value: ns.mutable } = { value: 5 });
}, TypeError);
assert.throws(() => {
	[ns.mutable = 3] = [];
}, TypeError);
assert.throws(() => {
	({ value: ns.mutable = 3 } = {});
}, TypeError);
assert.throws(() => {
	[...ns.mutable] = [[5]];
}, TypeError);
assert.throws(() => {
	for (ns.mutable of [5]) {
		// empty
	}
}, TypeError);
assert.throws(() => {
	for (ns.mutable in { key: 1 }) {
		// empty
	}
}, TypeError);

assert.throws(() => {
	ns.constant = 2;
}, TypeError);
assert.strictEqual(constant, 1);

assert.throws(() => {
	ns.object = {};
}, TypeError);

ns.mutable ||= 2;
ns.mutable ??= 2;
assert.strictEqual(mutable, 1);
assert.throws(() => {
	ns.mutable &&= 2;
}, TypeError);

ns.object.value = 2;
assert.strictEqual(object.value, 2);
assert.strictEqual(ns.object.value, 2);

import * as ns from './dep.js';
import { mutable } from './dep.js';

assert.strictEqual(ns.mutable, 1);

assert.throws(() => {
	delete ns.mutable;
}, TypeError);
assert.throws(() => {
	delete ns['mutable'];
}, TypeError);
assert.strictEqual(mutable, 1);

assert.strictEqual(delete ns.missing, true);
assert.strictEqual(delete ns['missing'], true);
assert.strictEqual(delete ns?.missing, true);

const existingKey = 'mutable';
assert.throws(() => {
	delete ns[existingKey];
}, TypeError);
assert.strictEqual(mutable, 1);

const missingKey = 'missing';
assert.strictEqual(delete ns[missingKey], true);

assert.throws(() => {
	delete ns?.mutable;
}, TypeError);

import { ns } from './dep.js';

function runInTryCatch(fn) {
	try {
		return fn();
	} catch {}
}

function getBar(obj) {
	return obj.bar;
}

assert.strictEqual(runInTryCatch(() => getBar(ns.foo)), 'baz');
